
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    date date NOT NULL,
    place character varying NOT NULL,
    id_owner uuid NOT NULL,
    status character varying NOT NULL
);

CREATE TABLE participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_user uuid NOT NULL,
    id_event uuid NOT NULL
);

CREATE TABLE payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    amount integer NOT NULL,
    date date NOT NULL,
    id_participant_plus uuid,
    id_participant_minus uuid
);

CREATE TABLE recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_spending uuid NOT NULL,
    id_participant_who_benefits uuid NOT NULL
);

CREATE TABLE spending (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_participant_who_spend uuid NOT NULL,
    description character varying NOT NULL,
    amount integer NOT NULL,
    date date NOT NULL
);

CREATE TABLE users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    last_name character varying NOT NULL,
    first_name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL
);

ALTER TABLE ONLY events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);

ALTER TABLE ONLY participants
    ADD CONSTRAINT participants_pkey PRIMARY KEY (id);

ALTER TABLE ONLY payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (id);

ALTER TABLE ONLY spending
    ADD CONSTRAINT spending_pkey PRIMARY KEY (id);

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY participants
    ADD CONSTRAINT id_event FOREIGN KEY (id_event) REFERENCES events(id);

ALTER TABLE ONLY events
    ADD CONSTRAINT id_owner FOREIGN KEY (id_owner) REFERENCES users(id);

ALTER TABLE ONLY payments
    ADD CONSTRAINT id_participant_minus FOREIGN KEY (id_participant_minus) REFERENCES participants(id);

ALTER TABLE ONLY payments
    ADD CONSTRAINT id_participant_plus FOREIGN KEY (id_participant_plus) REFERENCES participants(id);

ALTER TABLE ONLY recipients
    ADD CONSTRAINT id_participant_who_benefits FOREIGN KEY (id_participant_who_benefits) REFERENCES participants(id);

ALTER TABLE ONLY spending
    ADD CONSTRAINT id_participant_who_spend FOREIGN KEY (id_participant_who_spend) REFERENCES participants(id);

ALTER TABLE ONLY recipients
    ADD CONSTRAINT id_spending FOREIGN KEY (id_spending) REFERENCES spending(id);

ALTER TABLE ONLY participants
    ADD CONSTRAINT id_user FOREIGN KEY (id_user) REFERENCES users(id);
