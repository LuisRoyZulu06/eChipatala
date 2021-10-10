defmodule Echipatala.SelfAssessment do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Accounts.User

  @doc """
  Returns the list of tbl_user.

  ## Examples

      iex> list_tbl_user()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  def get_user_institution(id) do
    User
    |> where([e], e.institution_id == ^id and e.user_role == "STAFF")
    |> Repo.all()
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  def get_user_by_username(username) do
    Repo.one(
      from(
        u in User,
        where: fragment("lower(?) = lower(?)", u.username, ^username),
        limit: 1,
        select: u
      )
    )
    |> case do
      [] ->
        nil

      user ->
        user
    end
  end

  def get_user_by(nt_username) do
    User
    |>Repo.get_by(username: nt_username)
  end
end
