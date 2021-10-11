defmodule Echipatala.Repo.Migrations.CreateTblUser do
  use Ecto.Migration

  def change do
    create table(:tbl_user) do
      add :name, :string
      add :username, :string
      add :email, :string
      add :phone, :string
      add :gender, :string
      add :user_type, :integer
      add :user_role, :string
      add :status, :string
      add :password, :string
      add :auto_password, :string
      add :creator_id, :string
      add :institution_id, :id

      timestamps()
    end
    create unique_index(:tbl_user, [:email], name: :unique_email)
  end
end
