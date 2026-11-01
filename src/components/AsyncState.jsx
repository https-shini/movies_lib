const AsyncState = ({ isLoading, error, isEmpty, emptyMessage = "Nenhum resultado encontrado." }) => {
  if (isLoading) {
    return <p className="async-state" role="status" aria-live="polite">Carregando...</p>;
  }

  if (error) {
    return <p className="async-state async-state--error" role="alert">{error}</p>;
  }

  if (isEmpty) {
    return <p className="async-state">{emptyMessage}</p>;
  }

  return null;
};

export default AsyncState;
