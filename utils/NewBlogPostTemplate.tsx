export function NewBlogPostTemplate({
  title,
  shortDesc,
  url
}: {
  title: string;
  shortDesc: string;
  url: string;
}) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f6f6f6",
        padding: "24px"
      }}
    >
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{
          maxWidth: "600px",
          margin: "auto",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                padding: "32px 32px 16px 32px",
                color: "#22345E"
              }}
            >
              <h1
                style={{
                  fontSize: "2rem",
                  margin: "0 0 8px 0"
                }}
              >
                Un nouvel article, c’est extra !
              </h1>
              <h2
                style={{
                  color: "#F15A29",
                  fontSize: "1.3rem",
                  margin: "0 0 16px 0"
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  color: "#444",
                  fontSize: "1rem",
                  margin: "0 0 24px 0"
                }}
              >
                {shortDesc}
              </p>
              <div
                style={{
                  margin: "32px 0 16px 0"
                }}
              >
                <a
                  href={url}
                  style={{
                    display: "inline-block",
                    padding: "16px 32px",
                    background: "#FDBA3B",
                    color: "#22345E",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "1.1rem",
                    boxShadow: "0 2px 8px rgba(253, 186, 59, 0.3)"
                  }}
                >
                  Découvrir cet extra-ordinaire article 🚀
                </a>
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  marginTop: "24px"
                }}
              >
                Envie de ne rien manquer ? Reste connecté, d’autres surprises
                extra arrivent bientôt !
              </p>
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "24px 32px 0 32px",
                color: "#888",
                fontSize: "0.9rem"
              }}
            >
              Vous recevez cet email car vous êtes abonné au blog{" "}
              <strong>Cet Extra</strong>.<br />
              <a
                href={"https://cetextra.fr/blog/unsubscribe"}
                style={{ color: "#F15A29" }}
              >
                Se désinscrire
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
