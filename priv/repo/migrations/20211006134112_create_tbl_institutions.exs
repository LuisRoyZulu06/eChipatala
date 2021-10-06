defmodule Echipatala.Repo.Migrations.CreateTblInstitutions do
  use Ecto.Migration

  def change do
    create table(:tbl_institutions) do
      add :name, :string
      add :institution_type, :string
      add :tel, :string
      add :email, :string
      add :address, :string
      add :system_user_id, :string
      add :creator_id, :string
      add :logo, :string

      timestamps()
    end
  end
end
