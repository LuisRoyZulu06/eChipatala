defmodule Echipatala.Repo.Migrations.CreateTblUserLogs do
  use Ecto.Migration

  def change do
    create table(:tbl_user_logs) do
      add :activity, :string
      add :user_id, :id

      timestamps()
    end
  end
end
