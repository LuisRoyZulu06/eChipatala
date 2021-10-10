defmodule Echipatala.Repo.Migrations.CreateTblDisease do
  use Ecto.Migration

  def change do
    create table(:tbl_disease) do
      add :name, :string
      add :maker_id, references(:tbl_user, on_delete: :nothing)
      timestamps()
    end
  end
end
