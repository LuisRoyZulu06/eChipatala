defmodule Echipatala.Repo.Migrations.Stock do
  use Ecto.Migration

  def change do
    create table(:stock) do
      add :name, :string
      add :description, :string
      add :price, :decimal
      add :pharmacy_id, :integer
      add :creator_id, :string
      add :qty, :integer


      timestamps()
    end
  end
end
