defmodule Echipatala.Repo.Migrations.Pharmacy do
  use Ecto.Migration

  def change do
    create table(:pharmacy) do
      add :name, :string
      add :tel, :string
      add :email, :string
      add :address, :string
      add :creator_id, :string
      add :logo, :string

      timestamps()
    end
  end
end
