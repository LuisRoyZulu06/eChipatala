defmodule Echipatala.Staff.Workers.AutoAppointments do
  import Ecto.Query, warn: false
  alias Echipatala.Repo
  alias Echipatala.Appointments.Appointment

  def perform() do
    random_date()
  end

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
    time = Enum.random(8..20)
    appointment_date = "2021-10-#{date} #{time}:30:00.337196Z"
    status_note = "New appointment for #{appointment_date}"


    %{status_note: status_note,
      appointment_date: appointment_date,
      descript: description,
      client_id: 5,
      initiator_id: 5,
      inst_id: 1,
      appoint_ref: reference,
      doct_id: 2,
      init_date: DateTime.utc_now,
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
