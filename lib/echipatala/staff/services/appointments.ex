defmodule Echipatala.Staff.Services.Appointments do
  @moduledoc false
  import Ecto.Query, warn: false
  alias Echipatala.Repo
  alias Echipatala.Appointments.Appointment

  def list_all_appointment, do: Repo.all(Appointment)

  def list_appointments_per_institution(user) do
    institution_id = user.institution_id
    Appointment
    |> where([a], a.inst_id == ^institution_id)
#    |> where([a], a.inst_id == ^inst_id and a.client_id == ^client_id)
    |> Repo.all()
  end

  defp prepare_data(data) do
    Enum.map(data, fn item ->
      Map.from_struct(item)
      |> Map.delete(:__meta__)
    end)
  end
end
