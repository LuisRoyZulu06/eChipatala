defmodule Echipatala.Services.Service do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_service" do
    field :name, :string
    field :descript, :string
    field :has_subs, :string, default: "FALSE"
    field :is_sub, :string, default: "FALSE"
    field :consult_fee, :decimal, precision: 18, scale: 2
    field :status, :string, default: "ACTIVE"
    belongs_to :parent, Echipatala.Services.Service, foreign_key: :parent_id, type: :id
    belongs_to :institution, Echipatala.Institutions.InstitutionDetails, foreign_key: :inst_id, type: :id
    belongs_to :maker, Echipatala.Accounts.User, foreign_key: :maker_id, type: :id

    timestamps()
  end

  @doc false
  def changeset(service, attrs) do
    service
    |> cast(attrs,
      [
        :name,
        :descript,
        :consult_fee,
        :inst_id,
        :is_sub,
        :has_subs,
        :parent_id,
        :status,
        :maker_id
      ])
    |> validate_required(
      [
        :name,
        :descript,
        :consult_fee,
        :inst_id,
        :is_sub,
        :status,
        :maker_id
      ])
  end
end
