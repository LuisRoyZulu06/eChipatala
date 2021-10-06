defmodule EchipatalaWeb.InstitutionController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Emails.Email
  alias Echipatala.Institutions
  alias Echipatala.Institutions.InstitutionDetails
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy

  plug(
    EchipatalaWeb.Plugs.RequireAuth
    when action in [
           :institution_management,
           :create_institution
         ]
  )

  # plug(
  #   EchipatalaWeb.Plugs.RequireAdminAccess
  #   when action not in [
  #     :institution_management,
  #     :create_institution
  #   ]
  # )

  def institution_management(conn, _params) do
    inst = Institutions.list_institutions()
    render(conn, "institution_management.html", inst: inst)
  end

  def create_institution(conn, params) do
    case Institutions.create_institution(params) do
      {:ok, _} ->
        conn
        |> put_flash(:info, "Institution created successfully.")
        |> redirect(to: Routes.institution_path(conn, :institution_management))

        conn

      {:error, _} ->
        conn
        |> put_flash(:error, "Failed to create Institution.")
        |> redirect(to: Routes.institution_path(conn, :institution_management))
    end
  end

  def inst_details(conn, %{"id" => id}) do
   #  institution = Accounts.get_user!(id);
   #  institution_details = Institutions.get_all_institution_details(id)
   institution_details = Institutions.get_institution_details!(id)
   render(conn, "inst_details.html", institution_details: institution_details)
  end

  def update_institution_details(conn, %{"id" => id} = params) do
    institution = Institutions.get_institution_details!(id)

    Ecto.Multi.new()
     |> Ecto.Multi.update(:institution, InstitutionDetails.changeset(institution, params))
     |> Ecto.Multi.run(:userlogs, fn _repo, %{institution: institution} ->
     activity = "Institution updated with ID \"#{institution.id}\""

     userlogs = %{
       user_id: conn.assigns.user.id,
       activity: activity
     }

     UserLogs.changeset(%UserLogs{}, userlogs)
     |> Repo.insert()
   end)
   |> Repo.transaction()
   |> case do
     {:ok, %{institution: institution, userlogs: _userlogs}} ->
       conn
       |> put_flash(:info, "Institution details successfully updated:-) ")
       |> redirect(to: Routes.institution_path(conn, :inst_details,  id: id))

     {:error, _failed_operation, failed_value, _changes_so_far} ->
       reason = IntitutionController.traverse_errors(failed_value.errors) |> List.first()

       conn
       |> put_flash(:error, reason)
       |> redirect(to: Routes.institution_path(conn, :inst_details, id: id))
   end
 end


 # ------------------------------ TO Update if record exists, if not create. --------------------------------
 # def update_institution_details(conn, %{"id" => id} = params) do
 #   institution = Institutions.get_all_institution_details(id)

 #   case Institutions.get_all_institution_details(id) do
 #     nil->
 #       case Institutions.create_institution_details(params) do
 #         {:ok, _} ->
 #           conn
 #           |> put_flash(:info, "Institution created successfully.")
 #           |> redirect(to: Routes.institution_path(conn, :institution_management))
 #       end
 #     institution->
 #       case Institutions.update_institution_details(institution, params |> Map.put(:status, "1")) do
 #         {:ok, _} ->
 #           conn
 #           |> put_flash(:info, "Institution Updated successfully.")
 #           |> redirect(to: Routes.institution_path(conn, :institution_management))
 #       end
 #   end
 # end
 # ----------------------------------------------------------------------------------------------------------

  # def create_institution(conn, params) do
  #   case Institutions.create_institution_details(params) do
  #     {:ok, _} ->
  #       conn
  #       |> put_flash(:info, "Institution created successfully.")
  #       |> redirect(to: Routes.institution_path(conn, :institution_management))
  #
  #       conn
  #
  #     {:error, _} ->
  #       conn
  #       |> put_flash(:error, "Failed to create institution.")
  #       |> redirect(to: Routes.institution_path(conn, :institution_management))
  #   end
  # end


  def institution_stats(conn, _params) do
    render(conn, "institution_stats.html")
  end
  def traverse_errors(errors) do
   for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end
 end
