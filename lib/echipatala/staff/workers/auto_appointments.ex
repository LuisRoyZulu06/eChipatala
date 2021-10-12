defmodule Echipatala.Staff.Workers.AutoAppointments do
  import Ecto.Query, warn: false
  alias Echipatala.Repo
  alias Echipatala.Appointments.Appointment

  def description do
    num = Enum.random(1..1900000)
    [
      "Discription #{num}",
      "Discription #{num}",
      "Discription #{num}",
      "Discription #{num}",
      "Discription #{num}",
    ]
    |> Enum.random()
  end

  def reference do
    "e_CHIPATALA_#{Ecto.UUID.generate}"
  end

  def random_date() do
    date = Enum.random(1..30)
    appointment_date = "2021-10-#{date}"
    status_note = "New appointment for #{appointment_date}"


    %{status_note: status_note,
      appointment_date: appointment_date,
      descript: description,
      client_id: 5,
      initiator_id: 5,
      inst_id: 1,
      appoint_ref: reference,
      doct_id: 2,
      init_date: Date.utc_today,
      status: "PENDING"
    }
    |> appointments_insert()
  end

  def appointments_insert(request) do

    %Appointment{}
    |> Appointment.changeset(request)
    |> Repo.insert()
  end

end
