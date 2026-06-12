import { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Award, Star, Check, Search, X } from 'lucide-react';
import type { Team, BonusPrediction } from '../types';
import { teamApi, predictionApi } from '../services/api';
import clsx from 'clsx';

// Full squad lists for World Cup 2026 teams
const TOP_SCORER_CANDIDATES = [
  // Argentina
  { name: 'Lionel Messi', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Lautaro Martínez', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Julián Álvarez', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Paulo Dybala', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Ángel Di María', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Alejandro Garnacho', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Nicolás González', country: 'Argentina', code: 'ARG', position: 'Forward' },
  { name: 'Enzo Fernández', country: 'Argentina', code: 'ARG', position: 'Midfielder' },
  { name: 'Rodrigo De Paul', country: 'Argentina', code: 'ARG', position: 'Midfielder' },
  { name: 'Leandro Paredes', country: 'Argentina', code: 'ARG', position: 'Midfielder' },
  { name: 'Alexis Mac Allister', country: 'Argentina', code: 'ARG', position: 'Midfielder' },
  { name: 'Giovani Lo Celso', country: 'Argentina', code: 'ARG', position: 'Midfielder' },
  { name: 'Exequiel Palacios', country: 'Argentina', code: 'ARG', position: 'Midfielder' },
  { name: 'Nicolás Otamendi', country: 'Argentina', code: 'ARG', position: 'Defender' },
  { name: 'Cristian Romero', country: 'Argentina', code: 'ARG', position: 'Defender' },
  { name: 'Lisandro Martínez', country: 'Argentina', code: 'ARG', position: 'Defender' },
  { name: 'Nahuel Molina', country: 'Argentina', code: 'ARG', position: 'Defender' },
  { name: 'Marcos Acuña', country: 'Argentina', code: 'ARG', position: 'Defender' },
  { name: 'Gonzalo Montiel', country: 'Argentina', code: 'ARG', position: 'Defender' },
  { name: 'Emiliano Martínez', country: 'Argentina', code: 'ARG', position: 'Goalkeeper' },
  { name: 'Franco Armani', country: 'Argentina', code: 'ARG', position: 'Goalkeeper' },

  // France
  { name: 'Kylian Mbappé', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Marcus Thuram', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Olivier Giroud', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Randal Kolo Muani', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Ousmane Dembélé', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Kingsley Coman', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Christopher Nkunku', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Antoine Griezmann', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Bradley Barcola', country: 'France', code: 'FRA', position: 'Forward' },
  { name: 'Aurélien Tchouaméni', country: 'France', code: 'FRA', position: 'Midfielder' },
  { name: 'Eduardo Camavinga', country: 'France', code: 'FRA', position: 'Midfielder' },
  { name: 'N\'Golo Kanté', country: 'France', code: 'FRA', position: 'Midfielder' },
  { name: 'Adrien Rabiot', country: 'France', code: 'FRA', position: 'Midfielder' },
  { name: 'Warren Zaïre-Emery', country: 'France', code: 'FRA', position: 'Midfielder' },
  { name: 'Youssouf Fofana', country: 'France', code: 'FRA', position: 'Midfielder' },
  { name: 'William Saliba', country: 'France', code: 'FRA', position: 'Defender' },
  { name: 'Dayot Upamecano', country: 'France', code: 'FRA', position: 'Defender' },
  { name: 'Ibrahima Konaté', country: 'France', code: 'FRA', position: 'Defender' },
  { name: 'Theo Hernández', country: 'France', code: 'FRA', position: 'Defender' },
  { name: 'Jules Koundé', country: 'France', code: 'FRA', position: 'Defender' },
  { name: 'Benjamin Pavard', country: 'France', code: 'FRA', position: 'Defender' },
  { name: 'Mike Maignan', country: 'France', code: 'FRA', position: 'Goalkeeper' },
  { name: 'Hugo Lloris', country: 'France', code: 'FRA', position: 'Goalkeeper' },

  // England
  { name: 'Harry Kane', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Bukayo Saka', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Phil Foden', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Marcus Rashford', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Raheem Sterling', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Cole Palmer', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Anthony Gordon', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Jarrod Bowen', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Ivan Toney', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Ollie Watkins', country: 'England', code: 'ENG', position: 'Forward' },
  { name: 'Jude Bellingham', country: 'England', code: 'ENG', position: 'Midfielder' },
  { name: 'Declan Rice', country: 'England', code: 'ENG', position: 'Midfielder' },
  { name: 'Trent Alexander-Arnold', country: 'England', code: 'ENG', position: 'Midfielder' },
  { name: 'Kobbie Mainoo', country: 'England', code: 'ENG', position: 'Midfielder' },
  { name: 'Conor Gallagher', country: 'England', code: 'ENG', position: 'Midfielder' },
  { name: 'Adam Wharton', country: 'England', code: 'ENG', position: 'Midfielder' },
  { name: 'John Stones', country: 'England', code: 'ENG', position: 'Defender' },
  { name: 'Harry Maguire', country: 'England', code: 'ENG', position: 'Defender' },
  { name: 'Marc Guéhi', country: 'England', code: 'ENG', position: 'Defender' },
  { name: 'Kyle Walker', country: 'England', code: 'ENG', position: 'Defender' },
  { name: 'Kieran Trippier', country: 'England', code: 'ENG', position: 'Defender' },
  { name: 'Luke Shaw', country: 'England', code: 'ENG', position: 'Defender' },
  { name: 'Jordan Pickford', country: 'England', code: 'ENG', position: 'Goalkeeper' },
  { name: 'Aaron Ramsdale', country: 'England', code: 'ENG', position: 'Goalkeeper' },

  // Brazil
  { name: 'Vinícius Jr', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Rodrygo', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Endrick', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Raphinha', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Neymar Jr', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Richarlison', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Gabriel Martinelli', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Antony', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Gabriel Jesus', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Savinho', country: 'Brazil', code: 'BRA', position: 'Forward' },
  { name: 'Bruno Guimarães', country: 'Brazil', code: 'BRA', position: 'Midfielder' },
  { name: 'Lucas Paquetá', country: 'Brazil', code: 'BRA', position: 'Midfielder' },
  { name: 'Casemiro', country: 'Brazil', code: 'BRA', position: 'Midfielder' },
  { name: 'André', country: 'Brazil', code: 'BRA', position: 'Midfielder' },
  { name: 'João Gomes', country: 'Brazil', code: 'BRA', position: 'Midfielder' },
  { name: 'Marquinhos', country: 'Brazil', code: 'BRA', position: 'Defender' },
  { name: 'Éder Militão', country: 'Brazil', code: 'BRA', position: 'Defender' },
  { name: 'Gabriel Magalhães', country: 'Brazil', code: 'BRA', position: 'Defender' },
  { name: 'Wendell', country: 'Brazil', code: 'BRA', position: 'Defender' },
  { name: 'Danilo', country: 'Brazil', code: 'BRA', position: 'Defender' },
  { name: 'Alisson', country: 'Brazil', code: 'BRA', position: 'Goalkeeper' },
  { name: 'Ederson', country: 'Brazil', code: 'BRA', position: 'Goalkeeper' },

  // Portugal
  { name: 'Cristiano Ronaldo', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'Rafael Leão', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'João Félix', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'Gonçalo Ramos', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'Diogo Jota', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'Pedro Neto', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'Francisco Conceição', country: 'Portugal', code: 'POR', position: 'Forward' },
  { name: 'Bruno Fernandes', country: 'Portugal', code: 'POR', position: 'Midfielder' },
  { name: 'Bernardo Silva', country: 'Portugal', code: 'POR', position: 'Midfielder' },
  { name: 'Vitinha', country: 'Portugal', code: 'POR', position: 'Midfielder' },
  { name: 'João Palhinha', country: 'Portugal', code: 'POR', position: 'Midfielder' },
  { name: 'Rúben Neves', country: 'Portugal', code: 'POR', position: 'Midfielder' },
  { name: 'João Neves', country: 'Portugal', code: 'POR', position: 'Midfielder' },
  { name: 'Rúben Dias', country: 'Portugal', code: 'POR', position: 'Defender' },
  { name: 'Pepe', country: 'Portugal', code: 'POR', position: 'Defender' },
  { name: 'António Silva', country: 'Portugal', code: 'POR', position: 'Defender' },
  { name: 'Nuno Mendes', country: 'Portugal', code: 'POR', position: 'Defender' },
  { name: 'João Cancelo', country: 'Portugal', code: 'POR', position: 'Defender' },
  { name: 'Diogo Dalot', country: 'Portugal', code: 'POR', position: 'Defender' },
  { name: 'Diogo Costa', country: 'Portugal', code: 'POR', position: 'Goalkeeper' },
  { name: 'Rui Patrício', country: 'Portugal', code: 'POR', position: 'Goalkeeper' },

  // Spain
  { name: 'Lamine Yamal', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Álvaro Morata', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Nico Williams', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Ferran Torres', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Mikel Oyarzabal', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Dani Olmo', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Yeremy Pino', country: 'Spain', code: 'ESP', position: 'Forward' },
  { name: 'Pedri', country: 'Spain', code: 'ESP', position: 'Midfielder' },
  { name: 'Gavi', country: 'Spain', code: 'ESP', position: 'Midfielder' },
  { name: 'Rodri', country: 'Spain', code: 'ESP', position: 'Midfielder' },
  { name: 'Fabián Ruiz', country: 'Spain', code: 'ESP', position: 'Midfielder' },
  { name: 'Fermín López', country: 'Spain', code: 'ESP', position: 'Midfielder' },
  { name: 'Álex Baena', country: 'Spain', code: 'ESP', position: 'Midfielder' },
  { name: 'Aymeric Laporte', country: 'Spain', code: 'ESP', position: 'Defender' },
  { name: 'Robin Le Normand', country: 'Spain', code: 'ESP', position: 'Defender' },
  { name: 'Dani Carvajal', country: 'Spain', code: 'ESP', position: 'Defender' },
  { name: 'Marc Cucurella', country: 'Spain', code: 'ESP', position: 'Defender' },
  { name: 'Alejandro Grimaldo', country: 'Spain', code: 'ESP', position: 'Defender' },
  { name: 'Unai Simón', country: 'Spain', code: 'ESP', position: 'Goalkeeper' },
  { name: 'David Raya', country: 'Spain', code: 'ESP', position: 'Goalkeeper' },

  // Germany
  { name: 'Kai Havertz', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Jamal Musiala', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Florian Wirtz', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Niclas Füllkrug', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Leroy Sané', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Serge Gnabry', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Deniz Undav', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Thomas Müller', country: 'Germany', code: 'GER', position: 'Forward' },
  { name: 'Toni Kroos', country: 'Germany', code: 'GER', position: 'Midfielder' },
  { name: 'İlkay Gündoğan', country: 'Germany', code: 'GER', position: 'Midfielder' },
  { name: 'Joshua Kimmich', country: 'Germany', code: 'GER', position: 'Midfielder' },
  { name: 'Robert Andrich', country: 'Germany', code: 'GER', position: 'Midfielder' },
  { name: 'Chris Führich', country: 'Germany', code: 'GER', position: 'Midfielder' },
  { name: 'Antonio Rüdiger', country: 'Germany', code: 'GER', position: 'Defender' },
  { name: 'Jonathan Tah', country: 'Germany', code: 'GER', position: 'Defender' },
  { name: 'Nico Schlotterbeck', country: 'Germany', code: 'GER', position: 'Defender' },
  { name: 'David Raum', country: 'Germany', code: 'GER', position: 'Defender' },
  { name: 'Maximilian Mittelstädt', country: 'Germany', code: 'GER', position: 'Defender' },
  { name: 'Benjamin Henrichs', country: 'Germany', code: 'GER', position: 'Defender' },
  { name: 'Manuel Neuer', country: 'Germany', code: 'GER', position: 'Goalkeeper' },
  { name: 'Marc-André ter Stegen', country: 'Germany', code: 'GER', position: 'Goalkeeper' },

  // Netherlands
  { name: 'Cody Gakpo', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Memphis Depay', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Xavi Simons', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Donyell Malen', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Steven Bergwijn', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Wout Weghorst', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Brian Brobbey', country: 'Netherlands', code: 'NED', position: 'Forward' },
  { name: 'Frenkie de Jong', country: 'Netherlands', code: 'NED', position: 'Midfielder' },
  { name: 'Tijjani Reijnders', country: 'Netherlands', code: 'NED', position: 'Midfielder' },
  { name: 'Teun Koopmeiners', country: 'Netherlands', code: 'NED', position: 'Midfielder' },
  { name: 'Ryan Gravenberch', country: 'Netherlands', code: 'NED', position: 'Midfielder' },
  { name: 'Jerdy Schouten', country: 'Netherlands', code: 'NED', position: 'Midfielder' },
  { name: 'Georginio Wijnaldum', country: 'Netherlands', code: 'NED', position: 'Midfielder' },
  { name: 'Virgil van Dijk', country: 'Netherlands', code: 'NED', position: 'Defender' },
  { name: 'Nathan Aké', country: 'Netherlands', code: 'NED', position: 'Defender' },
  { name: 'Matthijs de Ligt', country: 'Netherlands', code: 'NED', position: 'Defender' },
  { name: 'Stefan de Vrij', country: 'Netherlands', code: 'NED', position: 'Defender' },
  { name: 'Denzel Dumfries', country: 'Netherlands', code: 'NED', position: 'Defender' },
  { name: 'Jeremie Frimpong', country: 'Netherlands', code: 'NED', position: 'Defender' },
  { name: 'Bart Verbruggen', country: 'Netherlands', code: 'NED', position: 'Goalkeeper' },

  // Belgium
  { name: 'Romelu Lukaku', country: 'Belgium', code: 'BEL', position: 'Forward' },
  { name: 'Jérémy Doku', country: 'Belgium', code: 'BEL', position: 'Forward' },
  { name: 'Leandro Trossard', country: 'Belgium', code: 'BEL', position: 'Forward' },
  { name: 'Loïs Openda', country: 'Belgium', code: 'BEL', position: 'Forward' },
  { name: 'Johan Bakayoko', country: 'Belgium', code: 'BEL', position: 'Forward' },
  { name: 'Dodi Lukébakio', country: 'Belgium', code: 'BEL', position: 'Forward' },
  { name: 'Kevin De Bruyne', country: 'Belgium', code: 'BEL', position: 'Midfielder' },
  { name: 'Youri Tielemans', country: 'Belgium', code: 'BEL', position: 'Midfielder' },
  { name: 'Amadou Onana', country: 'Belgium', code: 'BEL', position: 'Midfielder' },
  { name: 'Orel Mangala', country: 'Belgium', code: 'BEL', position: 'Midfielder' },
  { name: 'Arthur Vermeeren', country: 'Belgium', code: 'BEL', position: 'Midfielder' },
  { name: 'Jan Vertonghen', country: 'Belgium', code: 'BEL', position: 'Defender' },
  { name: 'Wout Faes', country: 'Belgium', code: 'BEL', position: 'Defender' },
  { name: 'Arthur Theate', country: 'Belgium', code: 'BEL', position: 'Defender' },
  { name: 'Timothy Castagne', country: 'Belgium', code: 'BEL', position: 'Defender' },
  { name: 'Koen Casteels', country: 'Belgium', code: 'BEL', position: 'Goalkeeper' },
  { name: 'Thibaut Courtois', country: 'Belgium', code: 'BEL', position: 'Goalkeeper' },

  // Italy
  { name: 'Gianluca Scamacca', country: 'Italy', code: 'ITA', position: 'Forward' },
  { name: 'Federico Chiesa', country: 'Italy', code: 'ITA', position: 'Forward' },
  { name: 'Mateo Retegui', country: 'Italy', code: 'ITA', position: 'Forward' },
  { name: 'Giacomo Raspadori', country: 'Italy', code: 'ITA', position: 'Forward' },
  { name: 'Stephan El Shaarawy', country: 'Italy', code: 'ITA', position: 'Forward' },
  { name: 'Riccardo Orsolini', country: 'Italy', code: 'ITA', position: 'Forward' },
  { name: 'Lorenzo Pellegrini', country: 'Italy', code: 'ITA', position: 'Midfielder' },
  { name: 'Nicolò Barella', country: 'Italy', code: 'ITA', position: 'Midfielder' },
  { name: 'Davide Frattesi', country: 'Italy', code: 'ITA', position: 'Midfielder' },
  { name: 'Sandro Tonali', country: 'Italy', code: 'ITA', position: 'Midfielder' },
  { name: 'Jorginho', country: 'Italy', code: 'ITA', position: 'Midfielder' },
  { name: 'Bryan Cristante', country: 'Italy', code: 'ITA', position: 'Midfielder' },
  { name: 'Alessandro Bastoni', country: 'Italy', code: 'ITA', position: 'Defender' },
  { name: 'Riccardo Calafiori', country: 'Italy', code: 'ITA', position: 'Defender' },
  { name: 'Gianluca Mancini', country: 'Italy', code: 'ITA', position: 'Defender' },
  { name: 'Giovanni Di Lorenzo', country: 'Italy', code: 'ITA', position: 'Defender' },
  { name: 'Federico Dimarco', country: 'Italy', code: 'ITA', position: 'Defender' },
  { name: 'Andrea Cambiaso', country: 'Italy', code: 'ITA', position: 'Defender' },
  { name: 'Gianluigi Donnarumma', country: 'Italy', code: 'ITA', position: 'Goalkeeper' },
  { name: 'Guglielmo Vicario', country: 'Italy', code: 'ITA', position: 'Goalkeeper' },

  // USA
  { name: 'Christian Pulisic', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Folarin Balogun', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Timothy Weah', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Gio Reyna', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Brenden Aaronson', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Josh Sargent', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Ricardo Pepi', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Haji Wright', country: 'USA', code: 'USA', position: 'Forward' },
  { name: 'Weston McKennie', country: 'USA', code: 'USA', position: 'Midfielder' },
  { name: 'Tyler Adams', country: 'USA', code: 'USA', position: 'Midfielder' },
  { name: 'Yunus Musah', country: 'USA', code: 'USA', position: 'Midfielder' },
  { name: 'Johnny Cardoso', country: 'USA', code: 'USA', position: 'Midfielder' },
  { name: 'Luca de la Torre', country: 'USA', code: 'USA', position: 'Midfielder' },
  { name: 'Antonee Robinson', country: 'USA', code: 'USA', position: 'Defender' },
  { name: 'Sergiño Dest', country: 'USA', code: 'USA', position: 'Defender' },
  { name: 'Chris Richards', country: 'USA', code: 'USA', position: 'Defender' },
  { name: 'Miles Robinson', country: 'USA', code: 'USA', position: 'Defender' },
  { name: 'Tim Ream', country: 'USA', code: 'USA', position: 'Defender' },
  { name: 'Joe Scally', country: 'USA', code: 'USA', position: 'Defender' },
  { name: 'Matt Turner', country: 'USA', code: 'USA', position: 'Goalkeeper' },
  { name: 'Ethan Horvath', country: 'USA', code: 'USA', position: 'Goalkeeper' },

  // Mexico
  { name: 'Hirving Lozano', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Santiago Giménez', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Raúl Jiménez', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Alexis Vega', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Henry Martín', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Uriel Antuna', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Roberto Alvarado', country: 'Mexico', code: 'MEX', position: 'Forward' },
  { name: 'Edson Álvarez', country: 'Mexico', code: 'MEX', position: 'Midfielder' },
  { name: 'Luis Chávez', country: 'Mexico', code: 'MEX', position: 'Midfielder' },
  { name: 'Orbelín Pineda', country: 'Mexico', code: 'MEX', position: 'Midfielder' },
  { name: 'Carlos Rodríguez', country: 'Mexico', code: 'MEX', position: 'Midfielder' },
  { name: 'Luis Romo', country: 'Mexico', code: 'MEX', position: 'Midfielder' },
  { name: 'Erick Gutiérrez', country: 'Mexico', code: 'MEX', position: 'Midfielder' },
  { name: 'César Montes', country: 'Mexico', code: 'MEX', position: 'Defender' },
  { name: 'Johan Vásquez', country: 'Mexico', code: 'MEX', position: 'Defender' },
  { name: 'Jesús Gallardo', country: 'Mexico', code: 'MEX', position: 'Defender' },
  { name: 'Jorge Sánchez', country: 'Mexico', code: 'MEX', position: 'Defender' },
  { name: 'Julián Araujo', country: 'Mexico', code: 'MEX', position: 'Defender' },
  { name: 'Guillermo Ochoa', country: 'Mexico', code: 'MEX', position: 'Goalkeeper' },

  // Canada
  { name: 'Jonathan David', country: 'Canada', code: 'CAN', position: 'Forward' },
  { name: 'Alphonso Davies', country: 'Canada', code: 'CAN', position: 'Defender' },
  { name: 'Cyle Larin', country: 'Canada', code: 'CAN', position: 'Forward' },
  { name: 'Tajon Buchanan', country: 'Canada', code: 'CAN', position: 'Forward' },
  { name: 'Liam Millar', country: 'Canada', code: 'CAN', position: 'Forward' },
  { name: 'Jacob Shaffelburg', country: 'Canada', code: 'CAN', position: 'Forward' },
  { name: 'Tani Oluwaseyi', country: 'Canada', code: 'CAN', position: 'Forward' },
  { name: 'Stephen Eustáquio', country: 'Canada', code: 'CAN', position: 'Midfielder' },
  { name: 'Ismaël Koné', country: 'Canada', code: 'CAN', position: 'Midfielder' },
  { name: 'Jonathan Osorio', country: 'Canada', code: 'CAN', position: 'Midfielder' },
  { name: 'Samuel Piette', country: 'Canada', code: 'CAN', position: 'Midfielder' },
  { name: 'Mark-Anthony Kaye', country: 'Canada', code: 'CAN', position: 'Midfielder' },
  { name: 'Moise Bombito', country: 'Canada', code: 'CAN', position: 'Defender' },
  { name: 'Kamal Miller', country: 'Canada', code: 'CAN', position: 'Defender' },
  { name: 'Derek Cornelius', country: 'Canada', code: 'CAN', position: 'Defender' },
  { name: 'Alistair Johnston', country: 'Canada', code: 'CAN', position: 'Defender' },
  { name: 'Richie Laryea', country: 'Canada', code: 'CAN', position: 'Defender' },
  { name: 'Milan Borjan', country: 'Canada', code: 'CAN', position: 'Goalkeeper' },
  { name: 'Maxime Crépeau', country: 'Canada', code: 'CAN', position: 'Goalkeeper' },

  // Uruguay
  { name: 'Darwin Núñez', country: 'Uruguay', code: 'URU', position: 'Forward' },
  { name: 'Luis Suárez', country: 'Uruguay', code: 'URU', position: 'Forward' },
  { name: 'Facundo Pellistri', country: 'Uruguay', code: 'URU', position: 'Forward' },
  { name: 'Maximiliano Araújo', country: 'Uruguay', code: 'URU', position: 'Forward' },
  { name: 'Cristian Olivera', country: 'Uruguay', code: 'URU', position: 'Forward' },
  { name: 'Agustín Canobbio', country: 'Uruguay', code: 'URU', position: 'Forward' },
  { name: 'Federico Valverde', country: 'Uruguay', code: 'URU', position: 'Midfielder' },
  { name: 'Rodrigo Bentancur', country: 'Uruguay', code: 'URU', position: 'Midfielder' },
  { name: 'Manuel Ugarte', country: 'Uruguay', code: 'URU', position: 'Midfielder' },
  { name: 'Nicolás de la Cruz', country: 'Uruguay', code: 'URU', position: 'Midfielder' },
  { name: 'Giorgian de Arrascaeta', country: 'Uruguay', code: 'URU', position: 'Midfielder' },
  { name: 'Emiliano Martínez', country: 'Uruguay', code: 'URU', position: 'Midfielder' },
  { name: 'Ronald Araújo', country: 'Uruguay', code: 'URU', position: 'Defender' },
  { name: 'José María Giménez', country: 'Uruguay', code: 'URU', position: 'Defender' },
  { name: 'Mathías Olivera', country: 'Uruguay', code: 'URU', position: 'Defender' },
  { name: 'Nahitan Nández', country: 'Uruguay', code: 'URU', position: 'Defender' },
  { name: 'Sebastián Cáceres', country: 'Uruguay', code: 'URU', position: 'Defender' },
  { name: 'Sergio Rochet', country: 'Uruguay', code: 'URU', position: 'Goalkeeper' },

  // Colombia
  { name: 'Luis Díaz', country: 'Colombia', code: 'COL', position: 'Forward' },
  { name: 'Rafael Santos Borré', country: 'Colombia', code: 'COL', position: 'Forward' },
  { name: 'Jhon Córdoba', country: 'Colombia', code: 'COL', position: 'Forward' },
  { name: 'Luis Sinisterra', country: 'Colombia', code: 'COL', position: 'Forward' },
  { name: 'Jhon Durán', country: 'Colombia', code: 'COL', position: 'Forward' },
  { name: 'Miguel Borja', country: 'Colombia', code: 'COL', position: 'Forward' },
  { name: 'James Rodríguez', country: 'Colombia', code: 'COL', position: 'Midfielder' },
  { name: 'Juan Quintero', country: 'Colombia', code: 'COL', position: 'Midfielder' },
  { name: 'Richard Ríos', country: 'Colombia', code: 'COL', position: 'Midfielder' },
  { name: 'Jefferson Lerma', country: 'Colombia', code: 'COL', position: 'Midfielder' },
  { name: 'Matheus Uribe', country: 'Colombia', code: 'COL', position: 'Midfielder' },
  { name: 'Jorge Carrascal', country: 'Colombia', code: 'COL', position: 'Midfielder' },
  { name: 'Dávinson Sánchez', country: 'Colombia', code: 'COL', position: 'Defender' },
  { name: 'Yerry Mina', country: 'Colombia', code: 'COL', position: 'Defender' },
  { name: 'Johan Mojica', country: 'Colombia', code: 'COL', position: 'Defender' },
  { name: 'Daniel Muñoz', country: 'Colombia', code: 'COL', position: 'Defender' },
  { name: 'Camilo Vargas', country: 'Colombia', code: 'COL', position: 'Goalkeeper' },

  // Japan
  { name: 'Takefusa Kubo', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Kaoru Mitoma', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Takumi Minamino', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Daichi Kamada', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Kyogo Furuhashi', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Junya Ito', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Ayase Ueda', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Ritsu Doan', country: 'Japan', code: 'JPN', position: 'Forward' },
  { name: 'Wataru Endo', country: 'Japan', code: 'JPN', position: 'Midfielder' },
  { name: 'Hidemasa Morita', country: 'Japan', code: 'JPN', position: 'Midfielder' },
  { name: 'Ao Tanaka', country: 'Japan', code: 'JPN', position: 'Midfielder' },
  { name: 'Keito Nakamura', country: 'Japan', code: 'JPN', position: 'Midfielder' },
  { name: 'Ko Itakura', country: 'Japan', code: 'JPN', position: 'Defender' },
  { name: 'Takehiro Tomiyasu', country: 'Japan', code: 'JPN', position: 'Defender' },
  { name: 'Maya Yoshida', country: 'Japan', code: 'JPN', position: 'Defender' },
  { name: 'Hiroki Ito', country: 'Japan', code: 'JPN', position: 'Defender' },
  { name: 'Shogo Taniguchi', country: 'Japan', code: 'JPN', position: 'Defender' },
  { name: 'Miki Yamane', country: 'Japan', code: 'JPN', position: 'Defender' },
  { name: 'Zion Suzuki', country: 'Japan', code: 'JPN', position: 'Goalkeeper' },

  // South Korea
  { name: 'Son Heung-min', country: 'South Korea', code: 'KOR', position: 'Forward' },
  { name: 'Hwang Hee-chan', country: 'South Korea', code: 'KOR', position: 'Forward' },
  { name: 'Lee Kang-in', country: 'South Korea', code: 'KOR', position: 'Forward' },
  { name: 'Cho Gue-sung', country: 'South Korea', code: 'KOR', position: 'Forward' },
  { name: 'Hwang Ui-jo', country: 'South Korea', code: 'KOR', position: 'Forward' },
  { name: 'Jeong Woo-yeong', country: 'South Korea', code: 'KOR', position: 'Forward' },
  { name: 'Lee Jae-sung', country: 'South Korea', code: 'KOR', position: 'Midfielder' },
  { name: 'Hwang In-beom', country: 'South Korea', code: 'KOR', position: 'Midfielder' },
  { name: 'Jung Woo-young', country: 'South Korea', code: 'KOR', position: 'Midfielder' },
  { name: 'Paik Seung-ho', country: 'South Korea', code: 'KOR', position: 'Midfielder' },
  { name: 'Kim Min-jae', country: 'South Korea', code: 'KOR', position: 'Defender' },
  { name: 'Kim Young-gwon', country: 'South Korea', code: 'KOR', position: 'Defender' },
  { name: 'Kim Jin-su', country: 'South Korea', code: 'KOR', position: 'Defender' },
  { name: 'Kim Tae-hwan', country: 'South Korea', code: 'KOR', position: 'Defender' },
  { name: 'Kim Seung-gyu', country: 'South Korea', code: 'KOR', position: 'Goalkeeper' },

  // Croatia
  { name: 'Andrej Kramarić', country: 'Croatia', code: 'CRO', position: 'Forward' },
  { name: 'Bruno Petković', country: 'Croatia', code: 'CRO', position: 'Forward' },
  { name: 'Ante Budimir', country: 'Croatia', code: 'CRO', position: 'Forward' },
  { name: 'Marko Pjaca', country: 'Croatia', code: 'CRO', position: 'Forward' },
  { name: 'Ivan Perišić', country: 'Croatia', code: 'CRO', position: 'Forward' },
  { name: 'Marco Pašalić', country: 'Croatia', code: 'CRO', position: 'Forward' },
  { name: 'Luka Modrić', country: 'Croatia', code: 'CRO', position: 'Midfielder' },
  { name: 'Mateo Kovačić', country: 'Croatia', code: 'CRO', position: 'Midfielder' },
  { name: 'Marcelo Brozović', country: 'Croatia', code: 'CRO', position: 'Midfielder' },
  { name: 'Lovro Majer', country: 'Croatia', code: 'CRO', position: 'Midfielder' },
  { name: 'Luka Sučić', country: 'Croatia', code: 'CRO', position: 'Midfielder' },
  { name: 'Nikola Vlašić', country: 'Croatia', code: 'CRO', position: 'Midfielder' },
  { name: 'Joško Gvardiol', country: 'Croatia', code: 'CRO', position: 'Defender' },
  { name: 'Duje Ćaleta-Car', country: 'Croatia', code: 'CRO', position: 'Defender' },
  { name: 'Josip Stanišić', country: 'Croatia', code: 'CRO', position: 'Defender' },
  { name: 'Borna Sosa', country: 'Croatia', code: 'CRO', position: 'Defender' },
  { name: 'Josip Juranović', country: 'Croatia', code: 'CRO', position: 'Defender' },
  { name: 'Dominik Livaković', country: 'Croatia', code: 'CRO', position: 'Goalkeeper' },

  // Serbia
  { name: 'Aleksandar Mitrović', country: 'Serbia', code: 'SRB', position: 'Forward' },
  { name: 'Dušan Vlahović', country: 'Serbia', code: 'SRB', position: 'Forward' },
  { name: 'Luka Jović', country: 'Serbia', code: 'SRB', position: 'Forward' },
  { name: 'Dušan Tadić', country: 'Serbia', code: 'SRB', position: 'Forward' },
  { name: 'Filip Kostić', country: 'Serbia', code: 'SRB', position: 'Forward' },
  { name: 'Andrija Živković', country: 'Serbia', code: 'SRB', position: 'Forward' },
  { name: 'Sergej Milinković-Savić', country: 'Serbia', code: 'SRB', position: 'Midfielder' },
  { name: 'Saša Lukić', country: 'Serbia', code: 'SRB', position: 'Midfielder' },
  { name: 'Nemanja Gudelj', country: 'Serbia', code: 'SRB', position: 'Midfielder' },
  { name: 'Ivan Ilić', country: 'Serbia', code: 'SRB', position: 'Midfielder' },
  { name: 'Veljko Birmančević', country: 'Serbia', code: 'SRB', position: 'Midfielder' },
  { name: 'Strahinja Pavlović', country: 'Serbia', code: 'SRB', position: 'Defender' },
  { name: 'Nikola Milenković', country: 'Serbia', code: 'SRB', position: 'Defender' },
  { name: 'Miloš Veljković', country: 'Serbia', code: 'SRB', position: 'Defender' },
  { name: 'Strahinja Eraković', country: 'Serbia', code: 'SRB', position: 'Defender' },
  { name: 'Predrag Rajković', country: 'Serbia', code: 'SRB', position: 'Goalkeeper' },
  { name: 'Vanja Milinković-Savić', country: 'Serbia', code: 'SRB', position: 'Goalkeeper' },

  // Morocco
  { name: 'Youssef En-Nesyri', country: 'Morocco', code: 'MAR', position: 'Forward' },
  { name: 'Hakim Ziyech', country: 'Morocco', code: 'MAR', position: 'Forward' },
  { name: 'Sofiane Boufal', country: 'Morocco', code: 'MAR', position: 'Forward' },
  { name: 'Ayoub El Kaabi', country: 'Morocco', code: 'MAR', position: 'Forward' },
  { name: 'Brahim Díaz', country: 'Morocco', code: 'MAR', position: 'Forward' },
  { name: 'Ilias Akhomach', country: 'Morocco', code: 'MAR', position: 'Forward' },
  { name: 'Azzedine Ounahi', country: 'Morocco', code: 'MAR', position: 'Midfielder' },
  { name: 'Sofyan Amrabat', country: 'Morocco', code: 'MAR', position: 'Midfielder' },
  { name: 'Bilal El Khannouss', country: 'Morocco', code: 'MAR', position: 'Midfielder' },
  { name: 'Selim Amallah', country: 'Morocco', code: 'MAR', position: 'Midfielder' },
  { name: 'Achraf Hakimi', country: 'Morocco', code: 'MAR', position: 'Defender' },
  { name: 'Nayef Aguerd', country: 'Morocco', code: 'MAR', position: 'Defender' },
  { name: 'Romain Saïss', country: 'Morocco', code: 'MAR', position: 'Defender' },
  { name: 'Noussair Mazraoui', country: 'Morocco', code: 'MAR', position: 'Defender' },
  { name: 'Yassine Bounou', country: 'Morocco', code: 'MAR', position: 'Goalkeeper' },

  // Poland
  { name: 'Robert Lewandowski', country: 'Poland', code: 'POL', position: 'Forward' },
  { name: 'Arkadiusz Milik', country: 'Poland', code: 'POL', position: 'Forward' },
  { name: 'Karol Świderski', country: 'Poland', code: 'POL', position: 'Forward' },
  { name: 'Krzysztof Piątek', country: 'Poland', code: 'POL', position: 'Forward' },
  { name: 'Adam Buksa', country: 'Poland', code: 'POL', position: 'Forward' },
  { name: 'Jakub Kamiński', country: 'Poland', code: 'POL', position: 'Forward' },
  { name: 'Piotr Zieliński', country: 'Poland', code: 'POL', position: 'Midfielder' },
  { name: 'Sebastian Szymański', country: 'Poland', code: 'POL', position: 'Midfielder' },
  { name: 'Przemysław Frankowski', country: 'Poland', code: 'POL', position: 'Midfielder' },
  { name: 'Jakub Moder', country: 'Poland', code: 'POL', position: 'Midfielder' },
  { name: 'Kacper Urbański', country: 'Poland', code: 'POL', position: 'Midfielder' },
  { name: 'Nicola Zalewski', country: 'Poland', code: 'POL', position: 'Midfielder' },
  { name: 'Jan Bednarek', country: 'Poland', code: 'POL', position: 'Defender' },
  { name: 'Jakub Kiwior', country: 'Poland', code: 'POL', position: 'Defender' },
  { name: 'Bartosz Salamon', country: 'Poland', code: 'POL', position: 'Defender' },
  { name: 'Paweł Dawidowicz', country: 'Poland', code: 'POL', position: 'Defender' },
  { name: 'Wojciech Szczęsny', country: 'Poland', code: 'POL', position: 'Goalkeeper' },
  { name: 'Łukasz Skorupski', country: 'Poland', code: 'POL', position: 'Goalkeeper' },

  // Ukraine
  { name: 'Artem Dovbyk', country: 'Ukraine', code: 'UKR', position: 'Forward' },
  { name: 'Mykhailo Mudryk', country: 'Ukraine', code: 'UKR', position: 'Forward' },
  { name: 'Andriy Yarmolenko', country: 'Ukraine', code: 'UKR', position: 'Forward' },
  { name: 'Roman Yaremchuk', country: 'Ukraine', code: 'UKR', position: 'Forward' },
  { name: 'Viktor Tsygankov', country: 'Ukraine', code: 'UKR', position: 'Forward' },
  { name: 'Georgiy Sudakov', country: 'Ukraine', code: 'UKR', position: 'Midfielder' },
  { name: 'Oleksandr Zinchenko', country: 'Ukraine', code: 'UKR', position: 'Midfielder' },
  { name: 'Ruslan Malinovskyi', country: 'Ukraine', code: 'UKR', position: 'Midfielder' },
  { name: 'Taras Stepanenko', country: 'Ukraine', code: 'UKR', position: 'Midfielder' },
  { name: 'Serhiy Sydorchuk', country: 'Ukraine', code: 'UKR', position: 'Midfielder' },
  { name: 'Vitaliy Mykolenko', country: 'Ukraine', code: 'UKR', position: 'Defender' },
  { name: 'Illia Zabarnyi', country: 'Ukraine', code: 'UKR', position: 'Defender' },
  { name: 'Mykola Matviyenko', country: 'Ukraine', code: 'UKR', position: 'Defender' },
  { name: 'Oleksandr Tymchyk', country: 'Ukraine', code: 'UKR', position: 'Defender' },
  { name: 'Anatoliy Trubin', country: 'Ukraine', code: 'UKR', position: 'Goalkeeper' },
  { name: 'Andriy Lunin', country: 'Ukraine', code: 'UKR', position: 'Goalkeeper' },

  // Other notable players
  { name: 'Erling Haaland', country: 'Norway', code: 'NOR', position: 'Forward' },
  { name: 'Martin Ødegaard', country: 'Norway', code: 'NOR', position: 'Midfielder' },
  { name: 'Mohamed Salah', country: 'Egypt', code: 'EGY', position: 'Forward' },
  { name: 'Sadio Mané', country: 'Senegal', code: 'SEN', position: 'Forward' },
  { name: 'Victor Osimhen', country: 'Nigeria', code: 'NGA', position: 'Forward' },
  { name: 'Enner Valencia', country: 'Ecuador', code: 'ECU', position: 'Forward' },
  { name: 'Breel Embolo', country: 'Switzerland', code: 'SUI', position: 'Forward' },
  { name: 'Granit Xhaka', country: 'Switzerland', code: 'SUI', position: 'Midfielder' },
  { name: 'Rasmus Højlund', country: 'Denmark', code: 'DEN', position: 'Forward' },
  { name: 'Christian Eriksen', country: 'Denmark', code: 'DEN', position: 'Midfielder' },
  { name: 'Mehdi Taremi', country: 'Iran', code: 'IRN', position: 'Forward' },
  { name: 'Sardar Azmoun', country: 'Iran', code: 'IRN', position: 'Forward' },
  { name: 'Almoez Ali', country: 'Qatar', code: 'QAT', position: 'Forward' },
  { name: 'Akram Afif', country: 'Qatar', code: 'QAT', position: 'Forward' },
  { name: 'Salem Al-Dawsari', country: 'Saudi Arabia', code: 'KSA', position: 'Forward' },
  { name: 'Wu Lei', country: 'China', code: 'CHN', position: 'Forward' },
];

// Map FIFA 3-letter codes to ISO 2-letter codes for flag CDN
const FIFA_TO_ISO: Record<string, string> = {
  // North & Central America / Caribbean
  USA: 'us', MEX: 'mx', CAN: 'ca', JAM: 'jm', CRC: 'cr', PAN: 'pa', HON: 'hn', SLV: 'sv', GUA: 'gt', HAI: 'ht', TRI: 'tt', CUB: 'cu',
  // South America
  ARG: 'ar', BRA: 'br', URU: 'uy', COL: 'co', CHI: 'cl', ECU: 'ec', PER: 'pe', VEN: 've', PAR: 'py', BOL: 'bo',
  // Western Europe
  GER: 'de', FRA: 'fr', ENG: 'gb-eng', ESP: 'es', ITA: 'it', NED: 'nl', POR: 'pt', BEL: 'be', SUI: 'ch', AUT: 'at',
  // British Isles
  WAL: 'gb-wls', SCO: 'gb-sct', NIR: 'gb-nir', IRL: 'ie',
  // Northern Europe
  DEN: 'dk', SWE: 'se', NOR: 'no', FIN: 'fi', ISL: 'is',
  // Central Europe
  POL: 'pl', CZE: 'cz', SVK: 'sk', HUN: 'hu', UKR: 'ua',
  // Southern Europe
  CRO: 'hr', SRB: 'rs', SLO: 'si', BIH: 'ba', MNE: 'me', ALB: 'al', MKD: 'mk', KOS: 'xk', GRE: 'gr', CYP: 'cy',
  // Eastern Europe
  ROU: 'ro', BUL: 'bg', TUR: 'tr', RUS: 'ru', GEO: 'ge', ARM: 'am', AZE: 'az',
  // Asia
  JPN: 'jp', KOR: 'kr', AUS: 'au', IRN: 'ir', KSA: 'sa', QAT: 'qa', UAE: 'ae', CHN: 'cn', IND: 'in', IDN: 'id',
  IRQ: 'iq', SYR: 'sy', JOR: 'jo', OMA: 'om', BHR: 'bh', KUW: 'kw', UZB: 'uz', THA: 'th', VIE: 'vn', MAS: 'my',
  // Africa
  MAR: 'ma', SEN: 'sn', NGA: 'ng', EGY: 'eg', GHA: 'gh', CMR: 'cm', CIV: 'ci', ALG: 'dz', TUN: 'tn', RSA: 'za',
  MLI: 'ml', BFA: 'bf', COD: 'cd', ZAM: 'zm', ZIM: 'zw', ANG: 'ao', MOZ: 'mz', UGA: 'ug', KEN: 'ke', TAN: 'tz',
  // Oceania
  NZL: 'nz',
  // Caribbean
  CUW: 'cw', CPV: 'cv',
};

const getFlagUrl = (code: string): string => {
  const isoCode = FIFA_TO_ISO[code] || code.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/48x36/${isoCode}.png`;
};

const bonusTypes = [
  { type: 'CHAMPION', label: 'World Cup Champion', description: 'Who will win the World Cup?', icon: Trophy, points: 15, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { type: 'RUNNER_UP', label: 'Runner-up', description: 'Who will finish second?', icon: Medal, points: 10, color: 'text-gray-500', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { type: 'THIRD_PLACE', label: 'Third Place', description: 'Who will finish third?', icon: Award, points: 8, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
];

export default function BonusPredictions() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [predictions, setPredictions] = useState<BonusPrediction[]>([]);
  const [topScorer, setTopScorer] = useState('');
  const [topScorerSearch, setTopScorerSearch] = useState('');
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    if (!topScorerSearch.trim()) return TOP_SCORER_CANDIDATES;
    const search = topScorerSearch.toLowerCase();
    return TOP_SCORER_CANDIDATES.filter(
      p => p.name.toLowerCase().includes(search) ||
           p.country.toLowerCase().includes(search) ||
           p.code.toLowerCase().includes(search)
    );
  }, [topScorerSearch]);

  useEffect(() => {
    Promise.all([
      teamApi.getAll(),
      predictionApi.getMyBonusPredictions(),
    ]).then(([teamsData, predsData]) => {
      setTeams(teamsData);
      setPredictions(predsData);
      const topScorerPred = predsData.find(p => p.predictionType === 'TOP_SCORER');
      if (topScorerPred?.selectedPlayerName) {
        setTopScorer(topScorerPred.selectedPlayerName);
      }
    }).finally(() => setLoading(false));
  }, []);

  const getPrediction = (type: string) => predictions.find(p => p.predictionType === type);

  // Get team IDs already selected for other team-based predictions (excluding current type)
  const getSelectedTeamIds = (excludeType: string): Set<number> => {
    const teamTypes = ['CHAMPION', 'RUNNER_UP', 'THIRD_PLACE'];
    const selectedIds = new Set<number>();

    for (const type of teamTypes) {
      if (type !== excludeType) {
        const pred = predictions.find(p => p.predictionType === type);
        if (pred?.selectedTeam?.id) {
          selectedIds.add(pred.selectedTeam.id);
        }
      }
    }

    return selectedIds;
  };

  const handleTeamSelect = async (type: string, teamId: number) => {
    if (saving) return;
    setSaving(type);
    try {
      await predictionApi.createBonus({
        predictionType: type,
        selectedTeamId: teamId,
      });
      const updated = await predictionApi.getMyBonusPredictions();
      setPredictions(updated);
      setExpandedType(null);
    } catch (error) {
      console.error('Failed to save bonus prediction:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleTopScorerSave = async (playerName?: string) => {
    const nameToSave = playerName || topScorer;
    if (saving || !nameToSave.trim()) return;
    setSaving('TOP_SCORER');
    try {
      await predictionApi.createBonus({
        predictionType: 'TOP_SCORER',
        selectedPlayerName: nameToSave.trim(),
      });
      const updated = await predictionApi.getMyBonusPredictions();
      setPredictions(updated);
      setTopScorer(nameToSave.trim());
      setTopScorerSearch('');
      setShowPlayerDropdown(false);
    } catch (error) {
      console.error('Failed to save top scorer prediction:', error);
    } finally {
      setSaving(null);
    }
  };

  const handlePlayerSelect = (player: typeof TOP_SCORER_CANDIDATES[0]) => {
    handleTopScorerSave(player.name);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Bonus Predictions</h1>
        <p className="text-purple-200">
          Predict the tournament winners to earn extra points
        </p>
        <div className="mt-4 flex items-center bg-red-500 rounded-lg px-4 py-3 text-sm font-medium shadow-lg">
          <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Bonus predictions will be locked once the tournament starts!</span>
        </div>
      </div>

      {/* Team-based predictions */}
      <div className="grid gap-6">
        {bonusTypes.map(({ type, label, description, icon: Icon, points, color, bgColor, borderColor }) => {
          const prediction = getPrediction(type);
          const selectedTeam = prediction?.selectedTeam;
          const isExpanded = expandedType === type;

          return (
            <div key={type} className={clsx('card border-2', borderColor)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={clsx('p-3 rounded-xl mr-4', bgColor)}>
                    <Icon className={clsx('h-8 w-8', color)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
                <span className="badge badge-info text-base px-4 py-2">+{points} pts</span>
              </div>

              {/* Selected team display */}
              {selectedTeam && !isExpanded ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <img
                      src={getFlagUrl(selectedTeam.code)}
                      alt={selectedTeam.name}
                      className="w-12 h-9 object-contain mr-4 rounded shadow"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{selectedTeam.name}</p>
                      <p className="text-sm text-gray-500">{selectedTeam.code}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {!isExpanded && (
                    <button
                      onClick={() => setExpandedType(type)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors"
                    >
                      Click to select a team
                    </button>
                  )}

                  {isExpanded && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Select a team:</p>
                        <button
                          onClick={() => setExpandedType(null)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                        {(() => {
                          const alreadySelectedIds = getSelectedTeamIds(type);
                          return teams.map(team => {
                            const isAlreadySelected = alreadySelectedIds.has(team.id);
                            return (
                              <button
                                key={team.id}
                                onClick={() => handleTeamSelect(type, team.id)}
                                disabled={saving === type || isAlreadySelected}
                                title={isAlreadySelected ? 'Already selected for another prediction' : undefined}
                                className={clsx(
                                  'flex items-center p-3 rounded-lg border-2 transition-all text-left',
                                  selectedTeam?.id === team.id
                                    ? 'border-avenga-red bg-red-50'
                                    : isAlreadySelected
                                    ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                    : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                                )}
                              >
                                <img
                                  src={getFlagUrl(team.code)}
                                  alt={team.name}
                                  className="w-10 h-7 object-contain mr-3 rounded shadow-sm"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={clsx('font-medium truncate', isAlreadySelected ? 'text-gray-400' : 'text-gray-900')}>{team.name}</p>
                                  <p className="text-xs text-gray-500">{team.code}</p>
                                </div>
                                {selectedTeam?.id === team.id && (
                                  <Check className="h-5 w-5 text-avenga-red ml-2" />
                                )}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {prediction?.scored && (
                <div className={clsx(
                  'mt-4 p-3 rounded-lg text-center font-medium',
                  prediction.pointsEarned && prediction.pointsEarned > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  {prediction.pointsEarned && prediction.pointsEarned > 0
                    ? `+${prediction.pointsEarned} points earned!`
                    : 'Incorrect prediction'}
                </div>
              )}
            </div>
          );
        })}

        {/* Top Scorer prediction */}
        <div className="card border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-blue-50">
                <Star className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Scorer</h3>
                <p className="text-sm text-gray-500">Who will score the most goals?</p>
              </div>
            </div>
            <span className="badge badge-info text-base px-4 py-2">+10 pts</span>
          </div>

          {/* Selected player display */}
          {topScorer && !showPlayerDropdown ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center">
                {(() => {
                  const player = TOP_SCORER_CANDIDATES.find(p => p.name === topScorer);
                  if (player) {
                    return (
                      <>
                        <img
                          src={getFlagUrl(player.code)}
                          alt={player.country}
                          className="w-10 h-7 object-contain mr-4 rounded shadow"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{player.name}</p>
                          <p className="text-sm text-gray-500">{player.country} · {player.position}</p>
                        </div>
                      </>
                    );
                  }
                  return (
                    <div>
                      <p className="font-semibold text-gray-900">{topScorer}</p>
                      <p className="text-sm text-gray-500">Custom entry</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search player by name or country..."
                  value={topScorerSearch}
                  onChange={(e) => {
                    setTopScorerSearch(e.target.value);
                    setShowPlayerDropdown(true);
                  }}
                  onFocus={() => setShowPlayerDropdown(true)}
                  className="input pl-10 pr-10"
                />
                {(topScorerSearch || showPlayerDropdown) && (
                  <button
                    onClick={() => {
                      setTopScorerSearch('');
                      setShowPlayerDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {showPlayerDropdown && (
                <div className="mt-2 max-h-80 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg">
                  {filteredPlayers.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredPlayers.map((player, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePlayerSelect(player)}
                          disabled={saving === 'TOP_SCORER'}
                          className="w-full flex items-center p-3 hover:bg-purple-50 transition-colors text-left"
                        >
                          <img
                            src={getFlagUrl(player.code)}
                            alt={player.country}
                            className="w-8 h-6 object-contain mr-3 rounded shadow-sm"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{player.name}</p>
                            <p className="text-xs text-gray-500">{player.country} · {player.position}</p>
                          </div>
                          {topScorer === player.name && (
                            <Check className="h-5 w-5 text-avenga-red" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="mb-2">No players found</p>
                      {topScorerSearch.trim() && (
                        <button
                          onClick={() => handleTopScorerSave(topScorerSearch.trim())}
                          disabled={saving === 'TOP_SCORER'}
                          className="btn btn-secondary text-sm"
                        >
                          Use "{topScorerSearch.trim()}" as custom entry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {getPrediction('TOP_SCORER')?.scored && (
            <div className={clsx(
              'mt-4 p-3 rounded-lg text-center font-medium',
              getPrediction('TOP_SCORER')?.pointsEarned && getPrediction('TOP_SCORER')!.pointsEarned! > 0
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            )}>
              {getPrediction('TOP_SCORER')?.pointsEarned && getPrediction('TOP_SCORER')!.pointsEarned! > 0
                ? `+${getPrediction('TOP_SCORER')?.pointsEarned} points earned!`
                : 'Incorrect prediction'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
