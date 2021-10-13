defmodule Echipatala.Staff.Services.Appointments do
  @moduledoc false
  import Ecto.Query, warn: false
  alias Echipatala.Repo
  alias Echipatala.Appointments.Appointment

  def list_all_appointment, do: Repo.all(Appointment)

  def list_appointments_per_institution(user, criteria) do
    IO.inspect(user)
    institution_id = user.institution_id
    query = from(a in Appointment)

    Enum.reduce(criteria, query, fn
      {:paginate, %{page: page, per_page: per_page}}, query ->
        from a in query,
        left_join: b in "tbl_user", on: a.client_id == b.id,
        left_join: c in "tbl_user", on: a.initiator_id == c.id,
        offset: ^((page - 1) * convert_string(per_page)),
        limit: ^per_page,
        order_by: [{:desc, a.inserted_at}],
        group_by: [a.id, a.status, a.appoint_ref, a.init_date, a.appointment_date, a.descript, a.status_note, b.name, c.name, a.inserted_at],
        select: %{
          id: a.id,
          status: a.status,
          appoint_ref: a.appoint_ref,
          appointment_date: (fragment("convert(varchar, ?, 106)", a.appointment_date)),
          initiated_date: (fragment("convert(varchar, ?, 106)", a.init_date)),
          descript: a.descript,
          date: a.appointment_date,
          status_note: a.status_note,
          client_name: b.name,
          initiator: c.name
        }
      end)
      |> Repo.all()
      |> organise()

  end

  def query() do
    criteria = [
      paginate: %{page: 1, per_page: 20}
      ]
    query = from(a in Appointment)

    Enum.reduce(criteria, query, fn
      {:paginate, %{page: page, per_page: per_page}}, query ->
        from a in query,
        left_join: b in "tbl_user", on: a.client_id == b.id,
        left_join: c in "tbl_user", on: a.initiator_id == c.id,
        offset: ^((page - 1) * convert_string(per_page)),
        limit: ^per_page,
        order_by: [{:desc, a.inserted_at}],
        group_by: [a.id, a.status, a.appoint_ref, a.init_date, a.appointment_date, a.descript, a.status_note, b.name, c.name, a.inserted_at],
        select: %{
          id: a.id,
          status: a.status,
          appoint_ref: a.appoint_ref,
          appointment_date: (fragment("convert(varchar, ?, 106)", a.appointment_date)),
          date: a.appointment_date,
          initiated_date: (fragment("convert(varchar, ?, 106)", a.init_date)),
          descript: a.descript,
          status_note: a.status_note,
          client_name: b.name,
          initiator: c.name
        }
      end)
      |> Repo.all()
      |> organise()
  end

  def organise(data) do
    today = filter_by_today(data)
    pending = filter_by_pending(data)
    complete = filter_by_complete(data)
    refered = filter_by_refered(data)
    declined = filter_by_declined(data)

    %{
      today: today,
      pending: pending,
      complete: complete,
      refered: refered,
      declined: declined
    }
  end


  def filter_by_today(data) do
    Enum.filter(data, fn item ->
      today = Date.utc_today
       date = item.date
       Date.compare(today, date) == :eq and item.status == "PENDING"
    end)
  end

  def filter_by_pending(data) do
    Enum.filter(data, fn item ->
      item.status == "PENDING"
    end)
  end

  def filter_by_complete(data) do
    Enum.filter(data, fn item ->
      item.status == "COMPLETE"
    end)
  end

  def filter_by_refered(data) do
    Enum.filter(data, fn item ->
      item.status == "REFERED"
    end)
  end

  def filter_by_declined(data) do
    Enum.filter(data, fn item ->
      item.status == "DECLINED"
    end)
  end



  def get_totaling() do
    Repo.all(Appointment)
    |> pending()
  end

  defp pending(data) do
    pending = Enum.sort_by(data, &(&1.status))  |> Enum.filter(&(&1.status == "PENDING")) |> Enum.count()
    complete = Enum.sort_by(data, &(&1.status))  |> Enum.filter(&(&1.status == "COMPLETE")) |> Enum.count()
    declined = Enum.sort_by(data, &(&1.status))  |> Enum.filter(&(&1.status == "DECLINED")) |> Enum.count()
    refered = Enum.sort_by(data, &(&1.status))  |> Enum.filter(&(&1.status == "REFERED")) |> Enum.count()
    total = Enum.count(data)

    %{
      declined: declined,
      pending: pending,
      complete: complete,
      total: total,
      refered: refered
    }
  end

  def updating_appointment(params) do
    appointment = Repo.get(Appointment, convert_string(params["id"]))
    Ecto.Multi.new()
      |> Ecto.Multi.update(:setting, Appointment.changeset(appointment, params))
      |> Repo.transaction()
  end


  defp prepare_data(data) do
    Enum.map(data, fn item ->
      Map.from_struct(item)
      |> Map.delete(:__meta__)
    end)
  end

  defp convert_string(item) do
    if is_bitstring(item) do
      item |> String.to_integer()
    else
      item
    end
  end
end
