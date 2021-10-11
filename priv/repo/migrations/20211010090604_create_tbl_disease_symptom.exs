defmodule Echipatala.Repo.Migrations.CreateTblDiseaseSymptom do
  use Ecto.Migration

  def change do
    create table(:tbl_disease_symptom) do
      add :percentage, :integer
      add :disease_id, references(:tbl_disease, on_delete: :nothing)
      add :symptom_id, references(:tbl_symptom, on_delete: :nothing)

      timestamps()
    end
  end
end
