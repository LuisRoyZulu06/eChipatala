defmodule Echipatala.Repo.Migrations.CreateTblAppointment do
  use Ecto.Migration

  def change do
    create table(:tbl_appointment) do
      add :appoint_ref, :string
      add :descript, :string
      add :init_date, :naive_datetime
      add :appointment_date, :naive_datetime
      add :status, :string
      add :status_note, :string
      add :initiator_id, references(:tbl_user, on_delete: :nothing)
      add :client_id, references(:tbl_user, on_delete: :nothing)
      add :doct_id, references(:tbl_user, on_delete: :nothing)
      add :inst_id, references(:tbl_institutions, on_delete: :nothing)

      timestamps()
    end
  end
end
