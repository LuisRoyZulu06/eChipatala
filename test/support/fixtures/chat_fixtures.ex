defmodule Echipatala.ChatFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Chat` context.
  """

  @doc """
  Generate a chat_details.
  """
  def chat_details_fixture(attrs \\ %{}) do
    {:ok, chat_details} =
      attrs
      |> Enum.into(%{
        client_id: "some client_id",
        msg: "some msg",
        staff_id: "some staff_id"
      })
      |> Echipatala.Chat.create_chat_details()

    chat_details
  end
end
