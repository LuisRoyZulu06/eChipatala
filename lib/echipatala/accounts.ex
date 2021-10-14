defmodule Echipatala.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo
  alias Echipatala.Accounts.User
  alias Echipatala.Institutions.InstitutionDetails
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


  def get_user_pharmacy(id) do
    User
    |> where([e], e.pharmacy_id == ^id and e.user_role == "PHARMACY" and e.user_type == 4)
    |> Repo.all()
  end


  # def get_institution_student(id) do
  #   User
  #   |> where([e], e.id == ^id)
  #   |> Repo.all()
  # end

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




  def system_users(conn, search_params, page, size) do
    User
    |> where([c], c.status != "DELETED" and c.user_type !=3)
    |> handle_user_filter(search_params)
    |> order_by(desc: :inserted_at)
    |> compose_user_select()
    |> Repo.paginate(page: page, page_size: size)
  end


  def client_users(conn, search_params, page, size) do
    User
    |> where([c], c.status != "DELETED" and c.user_type ==3)
    |> handle_user_filter(search_params)
    |> order_by(desc: :inserted_at)
    |> compose_user_select()
    |> Repo.paginate(page: page, page_size: size)
  end

  defp handle_user_filter(query, params) do
    Enum.reduce(params, query, fn
      {"isearch", value}, query when byte_size(value) > 0 ->
        user_isearch_filter(query, sanitize_term(value))

      {"name", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("lower(?) LIKE lower(?)", a.name, ^sanitize_term(value)))

      {"phone", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("lower(?) LIKE lower(?)", a.phone, ^sanitize_term(value)))

      {"username", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("lower(?) LIKE lower(?)", a.username, ^sanitize_term(value)))

      {"email", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("lower(?) LIKE lower(?)", a.email, ^sanitize_term(value)))

      {"from", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("CAST(? AS DATE) >= ?", a.inserted_at, ^value))

      {"to", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("CAST(? AS DATE) <= ?", a.inserted_at, ^value))



      {_, _}, query ->
        # Not a where parameter
        query
    end)
  end

  defp user_isearch_filter(query, search_term) do
       where(
         query,
         [a],
         fragment("lower(?) LIKE lower(?)", a.name, ^search_term) or
         fragment("lower(?) LIKE lower(?)", a.phone, ^search_term) or
         fragment("lower(?) LIKE lower(?)", a.username, ^search_term) or
         fragment("lower(?) LIKE lower(?)", a.email, ^search_term)
       )
    end

    defp sanitize_term(term), do: "%#{String.replace(term, "%", "\\%")}%"


  defp compose_user_select(query) do
    query
    |> select(
      [t],
      map(t, [
        :id,
        :name,
        :password,
        :auto_password,
        :creator_id,
        :email,
        :password,
        :user_type,
        :user_role,
        :status,
        :phone,
        :username,
        :inserted_at,
        :updated_at
      ])
    )
  end
end
