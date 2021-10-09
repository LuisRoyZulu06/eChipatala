defmodule Echipatala.Repo.Migrations.CreateTblService do
  use Ecto.Migration

  def change do
    create table(:tbl_service) do
      add :name, :string
      add :descript, :string
      add :consult_fee, :decimal, precision: 18, scale: 2
      add :is_sub, :string
      add :has_subs, :string
      add :status, :string
      add :maker_id, references(:tbl_user, on_delete: :nothing)
      add :parent_id, references(:tbl_service, on_delete: :nothing)
      add :inst_id, references(:tbl_institutions, on_delete: :nothing)

      timestamps()
    end
  end
end
