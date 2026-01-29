import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Link,
  Hr,
} from "@react-email/components";

interface NewsletterEmailProps {
  title: string;
  content: string; // This will be the MDX content (passed as string or HTML)
  url: string;
}

export const NewsletterEmail = ({
  title,
  content,
  url,
}: NewsletterEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>SARGA(labs)</Heading>
          
          <Section style={section}>
            <Heading style={h2}>{title}</Heading>
            <Text style={text}>
               {/* We will inject content here. Since we are sending raw text/html, 
                   we might want to just render it as text for simplicity or HTML if pre-processed. 
                   For this template, we assume 'content' is a summary or the full text. 
               */}
               {content}
            </Text>
            
            <Link href={url} style={button}>
              Read on Website
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            SARGA(labs) — A system for making.
            <br />
            <Link href="https://sargalabs.com" style={link}>sargalabs.com</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#000000",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#000000",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  padding: "0",
};

const h2 = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 20px",
};

const text = {
  color: "#dddddd",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  whiteSpace: "pre-wrap" as const, // Preserve newlines
};

const button = {
  backgroundColor: "#ffffff",
  borderRadius: "3px",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "25px",
};

const hr = {
  borderColor: "#333333",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};

const link = {
  color: "#8898aa",
  textDecoration: "underline",
};

export default NewsletterEmail;
