defmodule EchipatalaWeb.ClientController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.Institutions
  alias Echipatala.Institutions.InstitutionDetails
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
    select_institution = Institutions.list_institutions()
    render(conn, "index.html", select_institution: select_institution)
  end

  def traverse_errors(errors) do
   for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end
 end
