defmodule Echipatala.Notifications.Sms do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_sms" do
    field :date_sent, :string
    field :mobile, :string
    field :msg_count, :string
    field :sms, :string
    field :status, :string
    field :type, :string

    timestamps()
  end

  @doc false
  def changeset(sms, attrs) do
    sms
    |> cast(attrs, [:type, :mobile, :sms, :status, :msg_count, :date_sent])
    |> validate_required([:type, :mobile, :sms, :status, :msg_count, :date_sent])
  end
end
