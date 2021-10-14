defmodule Echipatala.Repo.Migrations.AlterUser do
  use Ecto.Migration

  def change do
    alter table(:tbl_user) do
      add :pharmacy_id, :id
    end
  end
end
