defmodule EchipatalaWeb.UserController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Accounts
  alias Echipatala.Accounts.User
  alias Echipatala.Emails
  alias Echipatala.Emails.Email
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy

  plug(
    EchipatalaWeb.Plugs.RequireAuth
    when action in [
           :new,
           :dashboard,
           :change_password,
           :new_password,
           :edit,
           :delete,
           :update,
           :create,
           :update_status,
           :user_actitvity,
           :user_management
         ]
  )

  # plug(
  #   EchipatalaWeb.Plugs.EnforcePasswordPolicy
  #   when action not in [:new_password, :change_password]
  # )

  # plug(
  #   EchipatalaWeb.Plugs.RequireAdminAccess
  #   when action not in [
  #     :new_password,
  #     :change_password,
  #     :dashboard,
  #     :user_actitvity
  #   ]
  # )

  # --/ Help function to redirect to requesting page on fuction being requested by many.
  def redirect_to_back(conn) do
    case List.keyfind(conn.req_headers, "referer", 0) do
      {"referer", referer} ->
        referer
        |> URI.parse()
        |> Map.get(:path)

      nil ->
        conn.request_path
    end
  end

  def dashboard(conn, _params) do
    render(conn, "dashboard.html")
  end

  def user_actitvity(conn, %{"id" => user_id}) do
    with :error <- confirm_token(conn, user_id) do
      conn
      |> put_flash(:error, "invalid token received")
      |> redirect(to: Routes.user_path(conn, :list_users))
    else
      {:ok, user} ->
        user_logs = Logs.get_user_logs_by(user.id)
        page = %{first: "Users", last: "Activity logs"}
        render(conn, "activity_logs.html", user_logs: user_logs, page: page)
    end
  end

  def user_profile(conn, _params) do
    render(conn, "user_profile.html")
  end

  def system_users(conn, _params) do
    system_users = Accounts.system_users()
    branches = Settings.branches()
    roles = Accounts.list_user_roles()
    render(conn, "system_users.html",
      system_users: system_users,
      branches: branches,
      roles: roles
    )
  end

  def activity_logs(conn, _params) do
    results = Logs.get_all_activity_logs()
    page = %{first: "Users", last: "Activity logs"}
    render(conn, "activity_logs.html", user_logs: results, page: page)
  end

  def update_status(conn, %{"id" => id, "status" => status}) do
    with :error <- confirm_token(conn, id) do
      conn
      |> put_flash(:error, "invalid token received")
      |> redirect(to: Routes.user_path(conn, :list_users))
    else
      {:ok, user} ->
        User.changeset(user, %{status: status})
        |> prepare_status_change(conn, user, status)
        |> Repo.transaction()
        |> case do
          {:ok, %{user: _user, user_log: _user_log}} ->
            conn
            |> put_flash(:info, "Changes applied successfully.")
            |> redirect(to: Routes.user_path(conn, :list_users))

          {:error, _failed_operation, failed_value, _changes_so_far} ->
            reason = traverse_errors(failed_value.errors) |> List.first()

            conn
            |> put_flash(:error, reason)
            |> redirect(to: Routes.user_path(conn, :list_users))
        end
    end
  end

  defp prepare_status_change(changeset, conn, user, status) do
    Ecto.Multi.new()
    |> Ecto.Multi.update(:user, changeset)
    |> Ecto.Multi.insert(
      :user_log,
      User_log.changeset(
        %UserLogs{},
        %{
          user_id: conn.assigns.user.id,
          activity: """
          #{
            case status,
              do:
                (
                  "1" -> "Activated"
                  _ -> "Disabled"
                )
          }
          #{user.first_name} #{user.last_name}
          """
        }
      )
    )
  end

  def edit(conn, %{"id" => id}) do
    with :error <- confirm_token(conn, id) do
      conn
      |> put_flash(:error, "invalid token received")
      |> redirect(to: Routes.user_path(conn, :list_users))
    else
      {:ok, user} ->
        user = %{user | id: sign_user_id(conn, user.id)}
        page = %{first: "Users", last: "Edit user"}
        render(conn, "edit.html", result: user, page: page)
    end
  end

  def update(conn, %{"user" => user_params}) do
    with :error <- confirm_token(conn, user_params["id"]) do
      conn
      |> put_flash(:error, "invalid token received")
      |> redirect(to: Routes.user_path(conn, :list_users))
    else
      {:ok, user} ->
        Ecto.Multi.new()
        |> Ecto.Multi.update(:update, User.changeset(user, Map.delete(user_params, "id")))
        |> Ecto.Multi.run(:log, fn %{update: _update} ->
          activity =
            "Modified user details with Email \"#{user.email}\" and First Name \"#{
              user.first_name
            }\""

          user_log = %{
            user_id: conn.assigns.user.id,
            activity: activity
          }

          User_log.changeset(%UserLogs{}, user_log)
          |> Repo.insert()
        end)
        |> Repo.transaction()
        |> case do
          {:ok, %{update: _update, log: _log}} ->
            conn
            |> put_flash(:info, "Changes applied successfully!")
            |> redirect(to: Routes.user_path(conn, :edit, id: user_params["id"]))

          {:error, _failed_operation, failed_value, _changes_so_far} ->
            reason = traverse_errors(failed_value.errors) |> List.first()

            conn
            |> put_flash(:error, reason)
            |> redirect(to: Routes.user_path(conn, :edit, id: user_params["id"]))
        end
    end
  rescue
    _ ->
      conn
      |> put_flash(:error, "An error occurred, reason unknown")
      |> redirect(to: Routes.user_path(conn, :list_users))
  end

  def create(conn, %{"user" => user_params}) do
    IO.inspect "=========================================="
    IO.inspect user_params

    pwd = random_string(6)
    user_params = Map.put(user_params, "password", pwd)

    Ecto.Multi.new()
    |> Ecto.Multi.insert(:user, User.changeset(%User{}, user_params))
    |> Ecto.Multi.run(:user_log, fn %{user: user} ->
      activity =
        "Created new user with Email \"#{user.email}\" and First Name #{user.first_name}\""

      user_log = %{
        user_id: conn.assigns.user.id,
        activity: activity
      }

      User_log.changeset(%UserLogs{}, user_log)
      |> Repo.insert()
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{user: user, user_log: _user_log}} ->
        Email.password(pwd, user.email)

        conn
        |> put_flash(
          :info,
          "#{String.capitalize(user.first_name)} created successfully and password is: #{pwd}"
        )
        |> redirect(to: Routes.user_path(conn, :list_users))

      {:error, _failed_operation, failed_value, _changes_so_far} ->
        reason = traverse_errors(failed_value.errors) |> List.first()

        conn
        |> put_flash(:error, reason)
        |> redirect(to: "#{redirect_to_back(conn)}")
        # |> redirect(to: Routes.user_path(conn, :list_users))
        # |> redirect(to: "#{redirect_to_back(conn)}?id=#{params["company_id"]}")
    end
  rescue
    _ ->
      conn
      |> put_flash(:error, "An error occurred, reason unknown. try again")
      |> redirect(to: "#{redirect_to_back(conn)}")
      # |> redirect(to: Routes.user_path(conn, :list_users))
  end

  def delete(conn, %{"id" => id}) do
    user = Accounts.get_user!(id)

    Ecto.Multi.new()
    |> Ecto.Multi.delete(:user, user)
    |> Ecto.Multi.run(:user_log, fn %{user: user} ->
      activity = "Deleted user with Email \"#{user.email}\" and First Name \"#{user.first_name}\""

      user_log = %{
        user_id: conn.assigns.user.id,
        activity: activity
      }

      User_log.changeset(%UserLogs{}, user_log)
      |> Repo.insert()
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{user: user, user_log: _user_log}} ->
        conn
        |> put_flash(:info, "#{String.capitalize(user.first_name)} deleted successfully.")
        |> redirect(to: Routes.user_path(conn, :list_users))

      {:error, _failed_operation, failed_value, _changes_so_far} ->
        reason = traverse_errors(failed_value.errors) |> List.first()

        conn
        |> put_flash(:error, reason)
        |> redirect(to: Routes.user_path(conn, :list_users))
    end
  end

  def get_user_by_username(username) do
    case Repo.get_by(User, username: username) do
      nil -> {:error, "invalid username address"}
      user -> {:ok, user}
    end
  end

  def get_user_by_email(email) do
    case Repo.get_by(User, email: email) do
      nil -> {:error, "invalid email address"}
      user -> {:ok, user}
    end
  end

  def get_user_by(nt_username) do
    case Repo.get_by(User, nt_username: nt_username) do
      nil -> {:error, "invalid username/password"}
      user -> {:ok, user}
    end
  end

  defp sign_user_id(conn, id),
    do: Phoenix.Token.sign(conn, "user salt", id, signed_at: System.system_time(:second))

  # ------------------ Password Reset ---------------------
  # ======================== PASSWORD POLICY ====================== #
   def password_policy(password_string) do
     cond do
       String.length(password_string) < 8 ->
         {:error, "Password must be at least 8 characters long."}

       has_case(password_string, :uppercase) == false ->
         {:error, "Password must have at least one uppercase character."}

       has_case(password_string, :lowercase) == false ->
         {:error, "Password must have at least one lowercase character."}

       has_special_char(password_string) == false ->
         {:error, "Password must have at least one special character."}

       true ->
         {:ok, "Password policy passed."}
     end
   end

   defp has_special_char(password) do
     char_list = "@#$%&!*" |> String.graphemes()

     password
     |> String.split("", trim: true)
     |> Enum.reduce_while(%{has_special_char: false}, fn char, acc ->
       case char in char_list do
         true ->
           {:halt, Map.put(acc, :has_special_char, true)}
         false ->
           {:cont, acc}
       end
     end)
     |> case do
       %{has_special_char: true} -> true
       _ -> false
     end
   end

   defp has_case(password, char_case) do
     case check_case(password, char_case) do
       {:ok, _response} ->
         true
       {:error, _response} ->
         false
     end
   end

   defp check_case(password, char_case) do
     password_list =
       password
       |> String.replace(~r/[[:punct:]]+$/, "", trim: true)
       |> String.replace(~r/\d/, "", trim: true)
       |> String.split("", trim: true)

     case char_case do
       :uppercase ->
         password_list
         |> Enum.reduce_while(%{has_upcase: false}, fn character, acc ->
           case character == String.upcase(character) do
             true -> {:halt, Map.put(acc, :has_upcase, true)}
             false -> {:cont, acc}
           end
         end)
         |>case do
           %{has_upcase: true} ->
             {:ok, "Uppercase character found."}
           _ -> {:error, "No uppercase character found."}
         end

       :lowercase ->
         password_list
         |> Enum.reduce_while(%{has_downcase: false}, fn character, acc ->
           case character == String.downcase(character) do
             true -> {:halt, Map.put(acc, :has_downcase, true)}
             false -> {:cont, acc}
           end
         end)
         |>case do
           %{has_downcase: true} ->
             {:ok, "Lowercase character found."}
           _ -> {:error, "No lowercase character found."}
         end
     end
   end


  def generate_clean_pass() do
    special_char = "@&!#$*%" |> String.graphemes() |> Enum.shuffle() |> Enum.take(1) |> List.to_string()
    candidate_password = random_string(7)<>special_char |> String.graphemes() |> Enum.shuffle() |> List.to_string()

    passed_policy? = password_policy(candidate_password)

    case passed_policy? do
      {:ok, _} ->
        candidate_password
      {:error, _} ->
        generate_clean_pass()
    end
  end

  # ---------------------------------- Forgot Password Token
  def forgot_password_reset(conn, %{"user" => user_params}) do
    with {:ok, user} <- get_user_by_email(user_params["email"]) do
      pwd = generate_clean_pass()
      user_params = Map.put(user_params, "password", pwd)

      IO.inspect("---------------------user params inspect------------------")
      IO.inspect user_params
      user
      |> forget_pwd_change(user_params)
      |> Repo.transaction()
      |> case do
        {:ok, %{update: _update, insert: _insert}} ->
          Email.forgot_pwd_confirmation(
            pwd,
            user_params["username"],
            user.email
          )

          Sms.create(%{
            type: "SYSTEM",
            mobile: user.phone,
            msg:
            "Hello #{user.username},\n Your password reset was successful.
             Your new password is #{pwd}"
          })

          conn
          |> put_flash(
            :info,
            "An email has been sent to your email address with your new login credentials."
          )
          |> redirect(to: Routes.session_path(conn, :new))

        {:error, _failed_operation, failed_value, _changes_so_far} ->
          traverse_errors(failed_value.errors)
          |> List.first()
          |> IO.inspect

          conn
          |> put_flash(:info, "An email has been sent to your email address with your new login credentials.")
          |> redirect(to: Routes.session_path(conn, :new))
      end
    else
      {:error, user} ->
        conn
        |> put_flash(:info, "An email has been sent to your email address with your new login credentials.")
        |> redirect(to: Routes.session_path(conn, :new))
    end
  end

  def forget_pwd_change(user, user_params) do
    pwd = String.trim(user_params["password"])

    Ecto.Multi.new()
    |> Ecto.Multi.update(:update, User.changeset(user, %{password: pwd, auto_pwd: "N"}))
    |> Ecto.Multi.insert(
      :insert,
      UserLogs.changeset(
        %UserLogs{},
        %{user_id: user.id, activity: "Forgot password reset."}
      )
    )
  end

  def new_password(conn, _params) do
    page = %{first: "Settings", last: "Change password"}
    render(conn, "change_password.html", page: page)
  end

  def forgot_password(conn, _params) do
    conn
    |> put_layout(false)
    |> render("forgot_password.html")
  end

  def token(conn, %{"user" => user_params}) do
    with {:error, reason} <- get_user_by_email(user_params["email"]) do
      conn
      |> put_flash(:error, reason)
      |> redirect(to: Routes.user_path(conn, :forgot_password))
    else
      {:ok, user} ->
        token =
          Phoenix.Token.sign(conn, "user salt", user.id, signed_at: System.system_time(:second))

        Email.confirm_password_reset(token, user.email)

        conn
        |> put_flash(:info, "We have sent you a mail")
        |> redirect(to: Routes.session_path(conn, :new))
    end
  end

  defp confirm_token(conn, token) do
    case Phoenix.Token.verify(conn, "user salt", token, max_age: 86400) do
      {:ok, user_id} ->
        user = Repo.get!(User, user_id)
        {:ok, user}

      {:error, _} ->
        :error
    end
  end

  def default_password(conn, %{"token" => token}) do
    with :error <- confirm_token(conn, token) do
      conn
      |> put_flash(:error, "Invalid/Expired token")
      |> redirect(to: Routes.user_path(conn, :forgot_password))
    else
      {:ok, user} ->
        pwd = random_string(6)

        case Accounts.update_user(user, %{password: pwd, auto_password: "Y"}) do
          {:ok, _user} ->
            Email.password_alert(user.email, pwd)

            conn
            |> put_flash(:info, "Password reset successful")
            |> redirect(to: Routes.session_path(conn, :new))

          {:error, _reason} ->
            conn
            |> put_flash(:error, "An error occured, try again!")
            |> redirect(to: Routes.user_path(conn, :forgot_password))
        end
    end
  end

  def reset_pwd(conn, %{"id" => id}) do
    with :error <- confirm_token(conn, id) do
      conn
      |> put_flash(:error, "invalid token received")
      |> redirect(to: Routes.user_path(conn, :list_users))
    else
      {:ok, user} ->
        pwd = random_string(6)
        changeset = User.changeset(user, %{password: pwd, auto_password: "Y"})

        Ecto.Multi.new()
        |> Ecto.Multi.update(:user, changeset)
        |> Ecto.Multi.insert(
          :user_log,
          User_log.changeset(
            %UserLogs{},
            %{
              user_id: conn.assigns.user.id,
              activity: """
              Reserted account password for user with mail \"#{user.email}\"
              """
            }
          )
        )
        |> Repo.transaction()
        |> case do
          {:ok, %{user: user, user_log: _user_log}} ->
            Email.password(user.email, pwd)
            conn |> json(%{"info" => "Password changed to: #{pwd}"})

          # conn |> json(%{"info" => "Password changed successfully"})

          {:error, _failed_operation, failed_value, _changes_so_far} ->
            reason = traverse_errors(failed_value.errors) |> List.first()
            conn |> json(%{"error" => reason})
        end
    end
  end

  def change_password(conn, %{"user" => user_params}) do
    case confirm_old_password(conn, user_params) do
      false ->
        conn
        |> put_flash(:error, "some fields were submitted empty!")
        |> redirect(to: Routes.user_path(conn, :new_password))

      result ->
        with {:error, reason} <- result do
          conn
          |> put_flash(:error, reason)
          |> redirect(to: Routes.user_path(conn, :new_password))
        else
          {:ok, _} ->
            conn.assigns.user
            |> change_pwd(user_params)
            |> Repo.transaction()
            |> case do
              {:ok, %{update: _update, insert: _insert}} ->
                conn
                |> put_flash(:info, "Password changed successful")
                |> redirect(to: Routes.user_path(conn, :new_password))

              {:error, _failed_operation, failed_value, _changes_so_far} ->
                reason = traverse_errors(failed_value.errors) |> List.first()

                conn
                |> put_flash(:error, reason)
                |> redirect(to: Routes.user_path(conn, :new_password))
            end
        end
    end
  # rescue
  #   _ ->
  #     conn
  #     |> put_flash(:error, "Password changed with errors")
  #     |> redirect(to: Routes.user_path(conn, :new_password))
  end

  def change_pwd(user, user_params) do
    pwd = String.trim(user_params["new_password"])

    Ecto.Multi.new()
    |> Ecto.Multi.update(:update, User.changeset(user, %{password: pwd, auto_password: "N"}))
    |> Ecto.Multi.insert(
      :insert,
      User_log.changeset(
        %UserLogs{},
        %{user_id: user.id, activity: "changed account password"}
      )
    )
  end

  defp confirm_old_password(
         conn,
         %{"old_password" => pwd, "new_password" => new_pwd}
       ) do
    IO.inspect("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    IO.inspect conn

    with true <- String.trim(pwd) != "",
         true <- String.trim(new_pwd) != "" do
      Auth.confirm_password(
        conn.assigns.user,
        String.trim(pwd)
      )
    else
      false -> false
    end
  end

  # ------------------ / password reset -------------------
  def traverse_errors(errors) do
    for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end

  def defaul_dashboard do
    today = Date.utc_today()
    days = Date.days_in_month(today)

    Date.range(%{today | day: 1}, %{today | day: days})
    |> Enum.map(&%{count: 0, day: "#{&1}", status: nil})
  end

  def random_string(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64()
    |> binary_part(0, length)
  end


 #----------------------------------------------- USER MANAGEMENT
  def staff_mgt(conn, %{"id" => id}) do
    IO.inspect "=====ID====="
    IO.inspect id
    staff_details = Accounts.get_user_institution(id)
    institution_details = Institutions.get_institution_details!(id)
    render(conn, "staff/staff_mgt.html", staff_details: staff_details, institution_details: institution_details)
  end

  def student_mgt(conn, %{"id" => id}) do
    student_details = Accounts.get_user_institution(id)
    institution_details = Institutions.get_institution_details!(id)
    render(conn, "students/student_mgt.html", student_details: student_details, institution_details: institution_details)
  end

  def create_institution_user(conn, params) do
    IO.inspect "=====PARAMS====="
    IO.inspect params

    case Accounts.get_user_by(params["username"]) do
      nil ->
        pwd = random_string(8)
        params = Map.put(params, "password", pwd)
        Ecto.Multi.new()
        |> Ecto.Multi.insert(:user, User.changeset(%User{}, params))
        |> Ecto.Multi.run(:user_log, fn _repo, %{user: user} ->
          activity = "Created user with id #{user.id}"
          user_log = %{user_id: conn.assigns.user.id, activity: activity}

          UserLogs.changeset(%UserLogs{}, user_log)
          |> Repo.insert()
        end)
        |> Repo.transaction()
        |> case do
          {:ok, %{user: _user, user_log: _user_log}} ->
            Email.send_alert(pwd, params["username"], params["email"])

            conn
            |> put_flash(:info, "User created Successfully")
            |> redirect(to: "#{redirect_to_back(conn)}?id=#{params["institution_id"]}")
            # |> redirect(to: Routes.user_path(conn, :staff_mgt, id: params["institution_id"]))

          {:error, _} ->
            conn
            |> put_flash(:error, "Failed to create user.")
            |> redirect(to: "#{redirect_to_back(conn)}?id=#{params["institution_id"]}")
            # |> redirect(to: Routes.user_path(conn, :profile_users, id: params["company_id"]))
        end

      _user ->
        conn
        |> put_flash(:error, "User with Username #{params["username"]} already exists.")
        |> redirect(to: "#{redirect_to_back(conn)}?id=#{params["institution_id"]}")
        # |> redirect(to: Routes.user_path(conn, :profile_users, id: params["company_id"]))
    end
  end

  def update_user(conn, params) do
    system_user = Accounts.get_user!(params["id"])

    Ecto.Multi.new()
    |> Ecto.Multi.update(:system_user, User.changeset(system_user, params))
    |> Ecto.Multi.run(:userlogs, fn _run, %{system_user: system_user} ->
      activity = "User updated with ID \"#{system_user.id}\""

      userlogs = %{
        user_id: conn.assigns.user.id,
        activity: activity
      }

      UserLogs.changeset(%UserLogs{}, userlogs)
      |> Repo.insert()
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{system_user: system_user, userlogs: _userlogs}} ->
        conn
        |> put_flash(:info, "User updated successfully.")
        |> redirect(to: "#{redirect_to_back(conn)}?id=#{params["institution_id"]}")


      {:error, _failed_operation, failed_value, _changes_so_far} ->
        reason = UserController.traverse_errors(failed_value.errors) |> List.first()

        conn
        |> put_flash(:error, reason)
        |> redirect(to: "#{redirect_to_back(conn)}?id=#{params["institution_id"]}")
    end
  end

  # ----------------- / user management --------------------
  def user_logs(conn, _params) do
    logs = Logs.list_tbl_user_logs()
    render(conn, "user_logs.html", logs: logs)
  end
end
