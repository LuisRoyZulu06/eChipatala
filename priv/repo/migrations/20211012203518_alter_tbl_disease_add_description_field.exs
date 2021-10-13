defmodule Echipatala.Repo.Migrations.AlterTblDiseaseAddDescriptionField do
  use Ecto.Migration

  def up do
    alter table(:tbl_disease) do
      add :description, :string
    end
  end

  def down do
    alter table(:tbl_disease) do
      remove :description, :string
    end
  end
end
