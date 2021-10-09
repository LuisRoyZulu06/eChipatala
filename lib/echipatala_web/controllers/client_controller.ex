defmodule EchipatalaWeb.ClientController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Emails.Email
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy

  plug(
    EchipatalaWeb.Plugs.RequireAuth
    when action in [
          #  :dashboard
         ]
  )

  # plug(
  #   EchipatalaWeb.Plugs.RequireAdminAccess
  #   when action not in [
  #     :institution_management,
  #     :create_institution
  #   ]
  # )

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def traverse_errors(errors) do
   for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end
 end
