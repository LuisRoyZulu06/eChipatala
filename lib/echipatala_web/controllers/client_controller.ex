defmodule EchipatalaWeb.ClientController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.Institutions
  alias Echipatala.Institutions.InstitutionDetails
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Emails.Email
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy
  alias Echipatala.Institutions
  alias Echipatala.Services

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

  def institutions(conn, _params) do
    insts = Institutions.list_institutions()
    render(conn, "institutions.html", institutions: insts)
  end

  def institution(conn, %{"id"=> id}) do
    inst = Institutions.get_institution(id)
    services= Services.institution_services(inst.id)
    render(conn, "institution.html",
      institution: inst,
      services: services
    )
  end

  def traverse_errors(errors) do
   for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end
 end
