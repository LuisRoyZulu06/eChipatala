defmodule Echipatala.AppointmentsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Appointments` context.
  """

  @doc """
  Generate a appointment.
  """
  def appointment_fixture(attrs \\ %{}) do
    {:ok, appointment} =
      attrs
      |> Enum.into(%{
        appoint_ref: "some appoint_ref",
        appointment_date: "some appointment_date",
        client_id: "some client_id",
        descript: "some descript",
        doct_id: "some doct_id",
        init_date: "some init_date",
        initiator_id: "some initiator_id",
        inst_id: "some inst_id",
        status: "some status",
        status_note: "some status_note"
      })
      |> Echipatala.Appointments.create_appointment()

    appointment
  end
end
