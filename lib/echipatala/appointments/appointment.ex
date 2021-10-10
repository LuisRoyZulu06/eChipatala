defmodule Echipatala.Appointments.Appointment do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_appointment" do
    field :appoint_ref, :string
    field :appointment_date, :naive_datetime
    field :descript, :string
    field :init_date, :naive_datetime
    field :status, :string
    field :status_note, :string
    belongs_to :institution, Echipatala.Institutions.InstitutionDetails, foreign_key: :inst_id, type: :id
    belongs_to :initiator, Echipatala.Accounts.User, foreign_key: :initiator_id, type: :id
    belongs_to :client, Echipatala.Accounts.User, foreign_key: :client_id, type: :id
    belongs_to :doctor, Echipatala.Accounts.User, foreign_key: :doct_id, type: :id

    timestamps()
  end

  @doc false
  def changeset(appointment, attrs) do
    appointment
    |> cast(attrs, [:appoint_ref, :descript, :inst_id, :client_id, :doct_id, :initiator_id, :init_date, :appointment_date, :status, :status_note])
    |> validate_required([:appoint_ref, :descript, :inst_id, :client_id, :doct_id, :initiator_id, :init_date, :appointment_date, :status, :status_note])
  end
end
