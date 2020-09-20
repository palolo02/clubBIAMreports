# Modules needed
import pandas as pd
import numpy as np


import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, func, inspect, and_


import os
import glob
import datetime
import calendar

# import variables from config file
from credentials import host
from credentials import pwd
from credentials import usr
from credentials import dialect
from credentials import port
from credentials import db


connection = f'{dialect}://{usr}:{pwd}@{host}:{port}/{db}'
print(connection)
engine = create_engine(connection)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)
# display tables/classes
display(Base.classes.keys())

# Save references to each table
Member = Base.classes.Member
Club = Base.classes.Club
Role = Base.classes.Role
Role_Type = Base.classes.Role_Type
Session2 = Base.classes.Session
Session_Type = Base.classes.Session_Type

# Start session
Session = sessionmaker()
Session.configure(bind=engine)
session = Session()


# Insert data for ==== CLUB =====
try:
    print(len(pd.read_sql_table("Club",engine)))
    # First record to insert
    if len(pd.read_sql_table("Club",engine)) == 0:
        club = Club(club_desc="BIAM",isActive=True)
        session.add(club)
        session.commit()
        print("Rows successfully inserted!")
    else:
        # Insert/update records from file
        print('Nothing to add now (Club)')
except:
    print("Error inserting into DB. Read log for more information")

# Insert data for ==== ROLE TYPE =====
try:
    print(len(pd.read_sql_table("Role_Type",engine)))
    # First record to insert
    if len(pd.read_sql_table("Role_Type",engine)) == 0:
        role_type_1 = Role_Type(role_type_desc='Equipo Evaluación')
        session.add(role_type_1)
        role_type_2 = Role_Type(role_type_desc='Comunicador')
        session.add(role_type_2)
        role_type_3 = Role_Type(role_type_desc='Liderazgo')
        session.add(role_type_3)
        session.commit()
        print("Rows successfully inserted!")
    else:
        # Insert/update records from file
        print('Nothing to add now (Role Type)')
except:
    print("Error inserting into DB. Read log for more information")

# Insert data for ==== ROLE =====
file_loc = "Datasource/Proyectos BIAM.xlsx"
df = pd.read_excel(file_loc, sheet_name="May 2020")
try:
    role_data = len(pd.read_sql_table("Role",engine))
    if(role_data == 0):
        # Remove white spaces and numbers for participations
        roles = df['Unnamed: 0'].str.replace('\d+', '').str.strip(' \n\t')
        roles = roles.str.replace('Evaluador Discurso','Evaluador')
        roles = roles.drop_duplicates()
        roles = roles.loc[2:,]
        print(roles)

        roles = pd.DataFrame({'role_desc':roles})
        # Evaluators
        roles['role_type_id'] = 1
        roles['isActive'] = True
        # Leadership
        roles.loc[(roles['role_desc'] == 'Toastmaster de Sesión') | (roles['role_desc'] == 'Discursos Improvisados'),['role_type_id']] = 3
        # Communicator
        roles.loc[(roles['role_desc'] == 'Discurso') | (roles['role_desc'] == '¿Qué es Toastmasters?'), ['role_type_id']] = 2
        print(roles)

        roles.to_sql('Role',con=engine,index=False,if_exists='replace',chunksize=len(roles))
    else:
        # Insert/update records from file
        print('Nothing to add now (Role)')
except:
    print("Error inserting into DB. Read log for more information")

# Insert data for ==== MEMBER =====
file_loc = "Datasource/Proyectos BIAM.xlsx"
df = pd.read_excel(file_loc, sheet_name="May 2020")
# Remove white spaces and numbers for participations
members = []
# Read all assistants
for i in range(1,len(df.columns)):
    temp = df.iloc[2:,[i]]
    header = df.columns[i]
    print('Header: ',header)
    temp.rename(columns={header:'member_desc'},inplace=True)
    temp.dropna(inplace=True)
    temp.drop_duplicates(inplace=True)
    members.append(temp)
# Combine data and remove duplicates
#print(type(members))
combined_df = pd.concat(members, ignore_index=True)
combined_df['member_desc'] = combined_df['member_desc'].str.strip()
#print(combined_df['member_desc'].values)
combined_df.drop_duplicates(inplace=True)
combined_df.reset_index(drop=True,inplace=True)
combined_df = combined_df.dropna(axis=0, subset=['member_desc'])
#print(combined_df.head())
combined_df['isActive'] = True
combined_df['start_dt'] = '2020-01-01'
combined_df['club_id'] = 10
combined_df['isGuest'] = False
print(f'member records: {len(pd.read_sql_table("Member",engine))}')

member_data = len(pd.read_sql_table("Member",engine))
if(member_data == 0):
    combined_df.to_sql('Member',con=engine,index=False,if_exists='append',chunksize=len(combined_df))
    print('Data inserted successfully!')
else:
    member = pd.read_sql_table("Member",engine)
    member_look_up = member.loc[:,["member_id","member_desc"]].set_index("member_desc")
    combined_df = combined_df.merge(member_look_up, how="left", on="member_desc")
    combined_df = combined_df[combined_df['member_id'].isnull()]
    combined_df = combined_df.loc[:,["member_desc","isActive","start_dt","club_id","isGuest"]]
    print(combined_df.columns)
    # insert only new members
    if(len(combined_df) > 0):
        combined_df.to_sql('Member',con=engine,index=False,if_exists='append',chunksize=len(combined_df))
        print('New Members inserted successfully!')
    else:
        print('No new members found.')

#print("Error inserting into DB (Members). Read log for more information")

# Read all assistants
# Insert data for ==== SESSION =====
file_loc = "Datasource/Proyectos BIAM.xlsx"
df = pd.read_excel(file_loc, sheet_name="Jun 2020")
sessions = []



for c in df.iloc[[0],:].columns[1:]: 
    temp = df.loc[:,[c]]
    temp['session_dt'] = c 
    temp['role_desc'] = df.iloc[:,[0]] 
    temp['session_type_id'] = 1
    temp['isWinner'] = False
    temp.rename(columns={c:'member_desc'},inplace=True)
    temp.dropna(inplace=True)
    temp['role_desc'] = temp['role_desc'].str.replace('\d+', '').str.strip(' \n\t')
    temp['role_desc'] = temp['role_desc'].str.replace('Evaluador Discurso','Evaluador')
    temp['member_desc'] = temp['member_desc'].str.strip()
    sessions.append(temp)

sessions_result = pd.concat(sessions,axis=0, ignore_index=True)
print(sessions_result.columns)


member = pd.read_sql_table("Member",engine)
member_look_up = member.loc[:,["member_id","member_desc"]].set_index("member_desc")


sessions_result = sessions_result.merge(member_look_up, how="left", on="member_desc")
print(sessions_result.columns)
#sessions_result = sessions_result.loc[:,["session_dt","member_id","role_id","session_type_id","isWinner"]]

sessions_result
role = pd.read_sql_table("Role",engine)
role_look_up = role.loc[:,["role_id","role_desc"]].set_index("role_desc")
print(role_look_up)
sessions_result = sessions_result.merge(role_look_up, how="left", on="role_desc")

print(sessions_result.columns)
sessions_result = sessions_result.loc[:,["session_dt","member_id","role_id","session_type_id","isWinner"]]
print(sessions_result)
sessions_result.dropna(inplace=True)

print(f'session records: {len(pd.read_sql_table("Session",engine))}')
session_data = len(pd.read_sql_table("Session",engine))
if(session_data == 0):
    sessions_result.to_sql('Session',con=engine,index=False,if_exists='append',chunksize=len(sessions_result))
    print('Data inserted successfully!')
else:
    print('Records already existing. In development')
    