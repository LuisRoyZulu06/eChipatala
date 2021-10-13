defmodule Echipatala.Diseases.Disease do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_disease" do
    field :maker_id, :integer
    field :name, :string
    field :description, :string

    timestamps()
  end

  @doc false
  def changeset(disease, attrs) do
    disease
    |> cast(attrs, [:name, :description, :maker_id])
    |> validate_required([:name, :maker_id])
  end
end
