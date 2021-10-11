defmodule EchipatalaWeb.SelfAssessmentController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
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

  # def index(conn, _params) do
  #   render(conn, "index.html")
  # end

  def index(conn, params) do
    render(conn, "self_assessment.html")
  end

  def results(conn, _params) do
    render(conn, "results.html")
  end

   def assess(conn, _params) do
    render(conn, "assess.html")
  end

  def update(conn, params) do
    # # role = Accounts.get_user_role!(params["id"])
    # # permits = %{role_string: get_perms(params)}
    # user= conn.assigns.user
    # patient = Accounts.get_user!(user.id) || %SelfAssessment{}

    # Ecto.Multi.new()
    # |> Ecto.Multi.isert_or_update(:update, SelfAssessment.changeset(patient, params))
    # |> Repo.transaction()
    # |> case do
    #   {:ok, %{update: _role, insert: _logs}} ->
    #     conn
    #     |> put_flash(:info, "Self Assessment successful!")
    #     |> redirect(to: Routes.user_role_path(conn, :edit, id: role.id))

    #   {:error, _failed_operation, failed_value, _changes_so_far} ->
    #     reason = traverse_errors(failed_value.errors) |> List.first()

    #     conn
    #     |> put_flash(:error, reason)
    #     |> redirect(to: Routes.user_role_path(conn, :edit, id: role.id))
    # end
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
