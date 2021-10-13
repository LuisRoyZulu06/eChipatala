defmodule EchipatalaWeb.StaffController do
  use EchipatalaWeb, :controller
  import Ecto.Query, warn: false
  alias Echipatala.{Logs, Repo, Logs.UserLogs, Auth}
  alias Echipatala.Emails.Email
  alias EchipatalaWeb.Plugs.EnforcePasswordPolicy
  alias Echipatala.Staff.Services.Appointments
  @limit 1000
  @page 1

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


# ==================== LOAD DASHBOARD ====================

  def index(conn, _params) do
    render(conn, "dashboard.html")
  end

# ================= UPDATE APPOINTMENT ==================
  def appointments(conn, %{"update_appointment" => request}) do
    IO.inspect(conn, label: "======================================")
    user = conn.assigns.user
    case Appointments.updating_appointment(request) do
      {:ok, _} ->
        conn
        |> json(%{status: true, data: [], message: "Update Successful"})
      {:error, _} ->
        conn
        |> json(%{status: false, data: [], message: "An Error occured!"})
    end
  end

# ================= LOAD APPOINTMENT PAGE =================
  def appointments(conn, _params) do
    criteria = [
      paginate: %{page: @page, per_page: @limit}
      ]

    user = conn.assigns.user
    data = Appointments.list_appointments_per_institution(user, criteria)
    totaling = Appointments.get_totaling()
    conn
    |> render("index.html", result: data,
      total: totaling
      )
  end


  def patients(conn, _params) do
    render(conn, "patients_index.html")
  end




  def traverse_errors(errors) do
   for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end

  def get_appointments(conn, params) do

  end
 end
