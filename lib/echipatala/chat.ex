defmodule Echipatala.Chat do
  @moduledoc """
  The Chat context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Chat.ChatDetails

  @doc """
  Returns the list of tbl_chat.

  ## Examples

      iex> list_tbl_chat()
      [%ChatDetails{}, ...]

  """
  def list_tbl_chat do
    Repo.all(ChatDetails)
  end

  @doc """
  Gets a single chat_details.

  Raises `Ecto.NoResultsError` if the Chat details does not exist.

  ## Examples

      iex> get_chat_details!(123)
      %ChatDetails{}

      iex> get_chat_details!(456)
      ** (Ecto.NoResultsError)

  """
  def get_chat_details!(id), do: Repo.get!(ChatDetails, id)

  @doc """
  Creates a chat_details.

  ## Examples

      iex> create_chat_details(%{field: value})
      {:ok, %ChatDetails{}}

      iex> create_chat_details(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_chat_details(attrs \\ %{}) do
    %ChatDetails{}
    |> ChatDetails.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a chat_details.

  ## Examples

      iex> update_chat_details(chat_details, %{field: new_value})
      {:ok, %ChatDetails{}}

      iex> update_chat_details(chat_details, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_chat_details(%ChatDetails{} = chat_details, attrs) do
    chat_details
    |> ChatDetails.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a chat_details.

  ## Examples

      iex> delete_chat_details(chat_details)
      {:ok, %ChatDetails{}}

      iex> delete_chat_details(chat_details)
      {:error, %Ecto.Changeset{}}

  """
  def delete_chat_details(%ChatDetails{} = chat_details) do
    Repo.delete(chat_details)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking chat_details changes.

  ## Examples

      iex> change_chat_details(chat_details)
      %Ecto.Changeset{data: %ChatDetails{}}

  """
  def change_chat_details(%ChatDetails{} = chat_details, attrs \\ %{}) do
    ChatDetails.changeset(chat_details, attrs)
  end
end
