defmodule EchipatalaWeb.LogsController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Accounts
  alias Echipatala.Accounts.User
  alias Echipatala.Emails
  alias Echipatala.Pages
  alias Echipatala.Emails.Email
  alias Echipatala.Notifications
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy

  plug(
    EchipatalaWeb.Plugs.RequireAuth
    when action in [
           :email_logs,
           :user_logs
         ]
  )

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

  def email_logs(conn, _params) do
    render(conn, "email.html")
  end


  def email_log_table(conn, params) do
    {draw, start, length, search_params} = Pages.search_options(params)
    json(conn, Pages.display(draw, Notifications.list_all_emails(
      conn.assigns.user,
      search_params,
      start,
      length
    )))
  end

  

  def user_profile(conn, _params) do
    render(conn, "user_profile.html")
  end

  def system_users(conn, _params) do
    system_users = Accounts.list_users()
    render(conn, "system_users.html",
      system_users: system_users
    )
  end

  def activity_logs(conn, _params) do
    results = Logs.get_all_activity_logs()
    page = %{first: "Users", last: "Activity logs"}
    render(conn, "activity_logs.html", user_logs: results, page: page)
  end


  # ----------------- / user management --------------------
  def user_logs(conn, _params) do
    logs = Logs.list_tbl_user_logs()
    render(conn, "user_logs.html", logs: logs)
  end
end
