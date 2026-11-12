import { Fragment } from "react";
import { Link } from "react-router";
import { personPath } from "../../lib/media";

/** Lista de nomes separados por vírgula; cada nome leva ao perfil da pessoa. */
const PersonLinks = ({ people }: { people: readonly { id: number; name: string }[] }) => (
  <>
    {people.map((person, index) => (
      <Fragment key={person.id}>
        {index > 0 && ", "}
        <Link to={personPath(person.id)} className="person-link hit-area">
          {person.name}
        </Link>
      </Fragment>
    ))}
  </>
);

export default PersonLinks;
