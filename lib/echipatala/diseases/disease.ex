defmodule Echipatala.Diseases.Disease do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_disease" do
    field :maker_id, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(disease, attrs) do
    disease
    |> cast(attrs, [:name, :maker_id])
    |> validate_required([:name, :maker_id])
  end
end
