defmodule EchipatalaWeb.StaffController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Emails.Email
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy
  alias Echipatala.Staff.Services.Appointments

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

  def index(conn, %{"load_appointments" => _request}) do
    IO.inspect(conn, label: "======================================")
    user = conn.assigns.user
    data = Appointments.list_appointments_per_institution(user)
    conn
    |> json(%{status: true, data: data, message: "returned all"})
  end

# ==================== LOAD DASHBOARD ====================

  def index(conn, _params) do
    render(conn, "dashboard.html")
  end

# ================= LOAD APPOINTMENT PAGE =================
  def appointments(conn, _params) do
    user = conn.assigns.user
    data = Appointments.list_appointments_per_institution(user)
    conn
    |> render("index.html", result: data)
  end




  def traverse_errors(errors) do
   for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end

  def get_appointments(conn, params) do

  end
 end
