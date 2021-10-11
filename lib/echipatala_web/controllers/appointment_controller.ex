defmodule EchipatalaWeb.AppointmentController do
  use EchipatalaWeb, :controller

  alias Echipatala.Appointments
  alias Echipatala.Appointments.Appointment

  def index(conn, _params) do
    tbl_appointment = Appointments.list_tbl_appointment()
    render(conn, "index.html", tbl_appointment: tbl_appointment)
  end

  def new(conn, _params) do
    changeset = Appointments.change_appointment(%Appointment{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"appointment" => appointment_params}) do
    case Appointments.create_appointment(appointment_params) do
      {:ok, appointment} ->
        conn
        |> put_flash(:info, "Appointment created successfully.")
        |> redirect(to: Routes.appointment_path(conn, :show, appointment))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    appointment = Appointments.get_appointment!(id)
    render(conn, "show.html", appointment: appointment)
  end

  def edit(conn, %{"id" => id}) do
    appointment = Appointments.get_appointment!(id)
    changeset = Appointments.change_appointment(appointment)
    render(conn, "edit.html", appointment: appointment, changeset: changeset)
  end

  def update(conn, %{"id" => id, "appointment" => appointment_params}) do
    appointment = Appointments.get_appointment!(id)

    case Appointments.update_appointment(appointment, appointment_params) do
      {:ok, appointment} ->
        conn
        |> put_flash(:info, "Appointment updated successfully.")
        |> redirect(to: Routes.appointment_path(conn, :show, appointment))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", appointment: appointment, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    appointment = Appointments.get_appointment!(id)
    {:ok, _appointment} = Appointments.delete_appointment(appointment)

    conn
    |> put_flash(:info, "Appointment deleted successfully.")
    |> redirect(to: Routes.appointment_path(conn, :index))
  end
end
