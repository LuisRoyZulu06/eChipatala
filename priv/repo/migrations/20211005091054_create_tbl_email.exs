defmodule Echipatala.Repo.Migrations.CreateTblEmail do
  use Ecto.Migration

  def change do
    create table(:tbl_email) do
      add :subject, :string
      add :sender_email_address, :string
      add :sender_name, :string
      add :email_body, :string
      add :receipient_email_address, :string
      add :status, :string, default: "READY"
      add :attempts, :string, default: "0"

      timestamps()
    end
  end
end
