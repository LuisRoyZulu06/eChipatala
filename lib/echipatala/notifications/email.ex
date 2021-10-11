defmodule Echipatala.Notifications.Email do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_email" do
    field :attempts, :string
    field :email_body, :string
    field :receipient_email_address, :string
    field :sender_email_address, :string
    field :sender_name, :string
    field :status, :string, default: "READY"
    field :subject, :string, default: "0"

    timestamps()
  end

  @doc false
  def changeset(email, attrs) do
    email
    |> cast(attrs, [:subject, :sender_email_address, :sender_name, :email_body, :receipient_email_address, :status, :attempts])
    # |> validate_required([:subject, :sender_email_address, :sender_name, :email_body, :receipient_email_address, :status, :attempts])
  end
end
