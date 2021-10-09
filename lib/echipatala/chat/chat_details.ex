defmodule Echipatala.Chat.ChatDetails do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_chat" do
    field :client_id, :string
    field :msg, :string
    field :staff_id, :string

    timestamps()
  end

  @doc false
  def changeset(chat_details, attrs) do
    chat_details
    |> cast(attrs, [:msg, :staff_id, :client_id])
    |> validate_required([:msg, :staff_id, :client_id])
  end
end
