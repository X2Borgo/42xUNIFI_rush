#HOW TO RUN
##eseguire i seguenti comandi
> npm install
> npm run host
> npm run backend

#DESCRIZIONE

# Planificazione delle date di esami alla Scuola di Ingegneria
## un esercizio di progettazione e programmazione strutturata – EV: Giugno ‘25

Nell’organizzazione dell’offerta didattica della Scuola di Ingegneria, ciascun docente deve pianificare in anticipo le date degli esami nel corso dell’anno.

La pianificazione è soggetta ad alcuni vincoli:

- Devono essere pianificate (almeno) 7 date nel corso dell’anno
- Collocate entro periodi destinati agli esami (durante i quali non ci sono lezioni)
- Distanziate di almeno 14 giorni una dall’altra
- Opportuno mitigare la sovrapposizione con esami di insegnamenti condivisi dagli stessi studenti  
  *(es. ingegneria del sw e basi di dati per ingegneria informatica III anno)*  
  *(mitigazione = distanza minima 3-5 giorni tra date conflittuali)*

**Vincolo aggiuntivo per esami in aula**:
- Data fissabile solo in giorni con aula:
  - Libera
  - Adeguata capienza al numero atteso di candidati  
  *(numero determinabile automaticamente dalla numerosità dei corsi di laurea)*

---

### Flusso del caso d'uso (interfaccia docente):
1. **Autenticazione**: 
   - Docente visualizza gli insegnamenti da pianificare
   - Per ciascun insegnamento:
     - Numero di date ancora da pianificare
     - Giorni con aule disponibili
     - Grado di interferenza con esami correlati

2. **Pianificazione iterativa**:
   - Docente seleziona ripetutamente date per ogni insegnamento
   - Ad ogni selezione:
     - Notifica se:
       - Date totali < 7 
       - Date non distanziate ≥14 giorni
     - Indicazione qualità per ogni data:
       - Sovrapposizione con altri esami correlati
       - Sottodimensionamento aula
       - Criticità occupazione aule

3. **Conclusione**:
   - Continua finché:
     - Vincoli necessari soddisfatti + docente consolida **OPPURE**
     - Docente salva soluzione intermedia (anche imperfetta)
   - Date salvate e trasmesse a:
     - Scuola (pianificazione ufficiale)
     - Docente (promemoria con istruzioni modifica)

```mermaid
graph TD
    A[Exam Date Planning System] --> B[Authentication Module]
    A --> C[Teaching Load Manager]
    A --> D[Date Planner Engine]
    A --> E[Resource Allocator]
    A --> F[Persistence Module]
    A --> G[Conflict Resolver]
    
    %% Authentication Module
    B --> B1[User Login]
    B --> B2[Session Management]
    
    %% Teaching Load Manager
    C --> C1[Course List Fetcher]
    C --> C2[Course Metadata Loader]
    C2 --> C21[Pending Dates Counter]
    C2 --> C22[Classroom Availability Checker]
    C2 --> C23[Interference Analyzer]
    C --> C3[Dashboard Renderer]
    
    %% Date Planner Engine
    D --> D1[Date Selector]
    D --> D2[Constraints Validator]
    D2 --> D21[Minimum Dates Checker]
    D2 --> D22[Separation Enforcer]
    D2 --> D23[Period Validator]
    D --> D3[Quality Assessor]
    D3 --> D31[Interference Scorer]
    D3 --> D32[Classroom Adequacy Evaluator]
    D3 --> D33[Occupation Criticality Calculator]
    D --> D4[State Manager]
    
    %% Resource Allocator
    E --> E1[Classroom Database]
    E1 --> E11[Capacity Lookup]
    E1 --> E12[Availability Tracker]
    E --> E2[Student Enrollment Estimator]
    
    %% Persistence Module
    F --> F1[Draft Saver]
    F --> F2[Finalizer]
    F2 --> F21[School Notifier]
    F2 --> F22[Teacher Confirmer]
    F2 --> F23[Modification Guide Generator]
    
    %% Conflict Resolver
    G --> G1[Shared Courses Identifier]
    G --> G2[Overlap Minimizer]
    
    %% Critical Data Flows
    D1 -->|Selected dates| D2
    D2 -->|Validation status| D1
    D1 -->|Proposed dates| D3
    D3 -->|Quality scores| D1
    C23 -->|Interference data| D31
    E12 -->|Availability| C22
    E11 -->|Capacity| D32
    G2 -->|Optimized gaps| D1
    D4 -->|Save state| F1
```
