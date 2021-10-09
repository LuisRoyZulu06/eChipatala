defmodule Echipatala.Repo.Migrations.CreateTblChat do
  use Ecto.Migration

  def change do
    create table(:tbl_chat) do
      add :msg, :string
      add :staff_id, :string
      add :client_id, :string

      timestamps()
    end
  end
end
