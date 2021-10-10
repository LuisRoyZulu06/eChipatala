defmodule Echipatala.Repo.Migrations.CreateTblSymptom do
  use Ecto.Migration

  def change do
    create table(:tbl_symptom) do
      add :name, :string
      add :category, :string
      add :maker_id, references(:tbl_user, on_delete: :nothing)

      timestamps()
    end
  end
end
