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
from credentials import Config

connection = Config.SQLALCHEMY_DATABASE_URI


def getAllResults(_member,_year,_engine):
    rs = _engine.execute(f'Select  m.member_desc,  (Extract(Year from session_dt)) as Anio,  (Extract(Month from session_dt)) as Mes,  count(*) as NoPart  from public."Session" s  JOIN public."Member" m  ON m.member_id = s.member_id  where m.member_desc like {_member}  and (Extract(Year from session_dt)) = {_year}  and "isGuest" = false  group by (Extract(Year from session_dt)),  (Extract(Month from session_dt)),  m.member_desc ')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['member_desc'] = row[0]
        d['year'] = row[1]
        d['month'] = row[2]
        d['nopart'] = row[3]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    return results


def getResultsPerMember(_member,_year, _engine):
    rs = _engine.execute(f'Select  m.member_desc,  (Extract(Year from session_dt)) as Anio,  (Extract(Month from session_dt)) as Mes,  rt.role_type_desc,  count(*) as NoPart  from public."Session" s  JOIN public."Member" m  ON m.member_id = s.member_id  JOIN public."Role" r  ON r.role_id = s.role_id  JOIN public."Role_Type" rt  ON r.role_type_id = rt.role_type_id  where m.member_desc like {_member}  and (Extract(Year from session_dt)) = {_year}  and "isGuest" = false  group by (Extract(Year from session_dt)),  (Extract(Month from session_dt)),  rt.role_type_desc,  m.member_desc ')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['member_desc'] = row[0]
        d['year'] = row[1]
        d['month'] = row[2]
        d['role_type_desc'] = row[3]
        d['nopart'] = row[4]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    return results

def getDetailedResultsPerMember(_member,_year, _engine):
    rs = _engine.execute(f'Select  m.member_desc, (Extract(Year from session_dt)) as Anio, (Extract(Month from session_dt)) as Mes, r.role_desc, rt.role_type_desc, count(*) as NoPart from public."Session" s JOIN public."Member" m ON m.member_id = s.member_id JOIN public."Role" r ON r.role_id = s.role_id JOIN public."Role_Type" rt ON r.role_type_id = rt.role_type_id where m.member_desc like {_member} and (Extract(Year from session_dt)) = {_year} group by (Extract(Year from session_dt)), (Extract(Month from session_dt)), r.role_desc, rt.role_type_desc, m.member_desc')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['member_desc'] = row[0]
        d['year'] = row[1]
        d['month'] = row[2]
        d['role_type'] = row[3]
        d['role_type_desc'] = row[4]
        d['nopart'] = row[5]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    return results


def getResultsPerRole(role_,_session, _engine):
    engine = _engine

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
    Session = Base.classes.Session
    Session_Type = Base.classes.Session_Type

    # Start session
    Session = _session
    Session.configure(bind=engine)
    session = Session()

    # Read Tables to determine what task to perform in each
    member_data = pd.read_sql_table("Member",engine)
    club_data = pd.read_sql_table("Club",engine)
    role_data = pd.read_sql_table("Role",engine)
    role_type_data = pd.read_sql_table("Role_Type",engine)
    session_data = pd.read_sql_table("Session",engine)
    session_type_data = pd.read_sql_table("Session_Type",engine)
    engine.dispose()

    result = session.query(Session2,Member,Role,Role_Type, Club).join(Member,Session2.member_id==Member.member_id).join(Role,Session2.role_id==Role.role_id).join(Role_Type,Role.role_type_id==Role_Type.role_type_id).join(Club,Member.club_id==Club.club_id).filter(Role.role_desc == role_).all()
    dicts = []
    for row in result:
        d = {}
        print(row.Session.session_dt, row.Role.role_desc, row.Role.role_desc, row.Role_Type.role_type_desc, row.Club.club_desc)
        d['session_dt'] = row.Session.session_dt
        d['member_desc'] = row.Role.role_desc
        d['role_desc'] = row.Role.role_desc
        d['role_type_desc'] = row.Role_Type.role_type_desc
        d['club_desc'] = row.Club.club_desc
        dicts.append(d)
    
    session.close()
    results = pd.DataFrame(dicts)
    results = results.groupby(by=["role_desc"]).agg({'session_dt':'count'})
    results = results.rename(columns={'session_dt':'NoParticipations'})
    
    return results

def getResultsPerRoleType(role_type_, _session, _engine):
    engine = _engine

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
    Session = Base.classes.Session
    Session_Type = Base.classes.Session_Type

    # Start session
    Session = _session
    Session.configure(bind=engine)
    session = Session()

    # Read Tables to determine what task to perform in each
    member_data = pd.read_sql_table("Member",engine)
    club_data = pd.read_sql_table("Club",engine)
    role_data = pd.read_sql_table("Role",engine)
    role_type_data = pd.read_sql_table("Role_Type",engine)
    session_data = pd.read_sql_table("Session",engine)
    session_type_data = pd.read_sql_table("Session_Type",engine)
    engine.dispose()

    result = session.query(Session2,Member,Role,Role_Type, Club).join(Member,Session2.member_id==Member.member_id).join(Role,Session2.role_id==Role.role_id).join(Role_Type,Role.role_type_id==Role_Type.role_type_id).join(Club,Member.club_id==Club.club_id).filter(Role_Type.role_type_desc == role_type_).all()
    dicts = []
    for row in result:
        d = {}
        print(row.Session.session_dt, row.Role.role_desc, row.Role.role_desc, row.Role_Type.role_type_desc, row.Club.club_desc)
        d['session_dt'] = row.Session.session_dt
        d['member_desc'] = row.Role.role_desc
        d['role_desc'] = row.Role.role_desc
        d['role_type_desc'] = row.Role_Type.role_type_desc
        d['club_desc'] = row.Club.club_desc
        dicts.append(d)
    session.close()
    results = pd.DataFrame(dicts)
    results = results.groupby(by=["role_type_desc"]).agg({'session_dt':'count'})
    results = results.rename(columns={'session_dt':'NoParticipations'})
    
    return results

def getResultsPerSession(date_,_session, _engine):
    engine = _engine

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
    Session = Base.classes.Session
    Session_Type = Base.classes.Session_Type

    # Start session
    Session = _session
    Session.configure(bind=engine)
    session = Session()

    # Read Tables to determine what task to perform in each
    member_data = pd.read_sql_table("Member",engine)
    club_data = pd.read_sql_table("Club",engine)
    role_data = pd.read_sql_table("Role",engine)
    role_type_data = pd.read_sql_table("Role_Type",engine)
    session_data = pd.read_sql_table("Session",engine)
    session_type_data = pd.read_sql_table("Session_Type",engine)
    engine.dispose()

    result = session.query(Session2,Member,Role,Role_Type, Club).join(Member,Session2.member_id==Member.member_id).join(Role,Session2.role_id==Role.role_id).join(Role_Type,Role.role_type_id==Role_Type.role_type_id).join(Club,Member.club_id==Club.club_id).filter(Session2.session_dt == date_).all()
    dicts = []
    for row in result:
        d = {}
        print(row.Session.session_dt, row.Role.role_desc, row.Role.role_desc, row.Role_Type.role_type_desc, row.Club.club_desc)
        d['session_dt'] = row.Session.session_dt
        d['member_desc'] = row.Role.role_desc
        d['role_desc'] = row.Role.role_desc
        d['role_type_desc'] = row.Role_Type.role_type_desc
        d['club_desc'] = row.Club.club_desc
        dicts.append(d)
    
    results = pd.DataFrame(dicts)
    results = results.groupby(by=["session_dt",""]).agg({'role_type_desc':'count'})
    results = results.rename(columns={'role_type_desc':'NoParticipations'})
    session.close()
    return results

def getResultsPerDateRange(year_, month_, _session,_engine):
    
    #engine = create_engine(connection,client_encoding='utf8')

    # reflect an existing database into a new model
    Base = automap_base()
    # reflect the tables
    Base.prepare(_engine, reflect=True)

    # Save references to each table
    Member = Base.classes.Member
    Club = Base.classes.Club
    Role = Base.classes.Role
    Role_Type = Base.classes.Role_Type
    Session2 = Base.classes.Session
    Session_Type = Base.classes.Session_Type
    # Start session
    _session.configure(bind=_engine)
    
    session = _session()
    
    _engine.dispose()

    num_days = calendar.monthrange(year_, month_)[1]
    start_date = datetime.date(year_, month_, 1)
    end_date = datetime.date(year_, month_, num_days)

    result = session.query(Member.member_desc, Role.role_desc, func.count(Session2.session_dt).label('NoParticipations')).join(Member,Session2.member_id==Member.member_id).join(Role, Session2.role_id == Role.role_id).filter(and_(Session2.session_dt >= start_date, Session2.session_dt <= end_date )).group_by(Member.member_desc,Role.role_desc).all()
    dicts = []

    for row in result:
        d = {}
        d['member_desc'] = row.member_desc
        d['role_desc'] = row.role_desc
        d['NoParticipations'] = row.NoParticipations
        dicts.append(d)

    results = pd.DataFrame(dicts)
    results = results.pivot_table(values='NoParticipations',index=[results.member_desc],columns='role_desc',aggfunc='sum', dropna=True)
    #results.reset_index(inplace=True)
    results.loc[:,'Total'] = results.sum(axis=1)
    results.sort_values(by='Total',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    results.rename(columns={'member_desc':'Socios'}, inplace=True)
    #print(results.head())
    session.close()
    return results


def getStatsPerDateRange(year_, month_, _engine):
    rs = _engine.execute(f'Select extract(month from session_dt) as Month_Desc, count(*) as Participations, count(distinct member_id) as Members, count(distinct session_dt) as Sessions from public."Session" where extract(month from session_dt) = {month_} and extract(year from session_dt) = {year_} group by extract(month from session_dt)')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['Month_Desc'] = row[0]
        d['Participations'] = row[1]
        d['Members'] = row[2]
        d['Sessions'] = row[3]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    return results

def getStatsPerYear(year_,_engine):
    rs = _engine.execute(f'Select m.member_id, m.member_desc, rt.role_type_desc, count(*) as NoParticipations FROM public."Session" s JOIN public."Member" m On m.member_id = s.member_id JOIN public."Role" r On s.role_id = r.role_id JOIN public."Role_Type" rt On r.role_type_id = rt.role_type_id where extract(year from (session_dt)) = {year_} group by m.member_id, m.member_desc, rt.role_type_desc order by m.member_id, count(*) desc ')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['member_id'] = row[0]
        d['member_desc'] = row[1]
        d['role_type_desc'] = row[2]
        d['NoParticipations'] = row[3]
        dicts.append(d)

    results = pd.DataFrame(dicts)
    results = results.pivot_table(values='NoParticipations',index=[results.member_desc],columns='role_type_desc',aggfunc='sum', dropna=True)
    results['Total'] = results.sum(axis=1)
    results['Com %'] = (results['Comunicador'] / results['Total'])*100
    results['Com %'] = results['Com %'].round(0)
    results['Eva %'] = (results['Equipo Evaluación'] / results['Total'])*100
    results['Eva %'] = results['Eva %'].round(0)
    results['Lid %'] = (results['Liderazgo'] / results['Total'])*100
    results['Lid %'] = results['Lid %'].round(0)
    results.sort_values(by='Total',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    results = results[['member_desc','Comunicador','Com %','Equipo Evaluación','Eva %','Liderazgo','Lid %','Total']]
    results.rename(columns={'role_type_desc':'Rol'}, inplace=True)
    results.rename(columns={'member_desc':'Socios'}, inplace=True)
    return results


def getStatsPerClub(year_,_engine):
    rs = _engine.execute(f'SELECT c.club_desc, count(distinct m.member_id) FROM public."Session" s JOIN public."Member" m 	ON m.member_id = s.member_id JOIN public."Club" c 	ON m.club_id = c.club_id where extract(year from (session_dt)) = {year_} group by c.club_desc order by count(distinct m.member_id) desc')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['club_desc'] = row[0]
        d['NoSocios'] = row[1]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    results.loc[len(results)] = results.sum(numeric_only=True, axis=0)
    results['club_desc'] = results['club_desc'].fillna('Total')
    results.sort_values(by='NoSocios',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    results.rename(columns={'club_desc':'Club'}, inplace=True)
    return results

def getStatsPerSessionType(year_,_engine):
    rs = _engine.execute(f'Select distinct session_type_desc, count(distinct session_dt)  from public."Session" s  JOIN public."Session_Type" st  	on st.session_type_id = s.session_type_id  WHERE EXTRACT(YEAR FROM (session_dt)) = {year_}  group by session_type_desc  order by count(distinct session_dt) desc')
    _engine.dispose()
    dicts = []
    for row in rs:
        d = {}
        d['session_type_desc'] = row[0]
        d['No Sesiones'] = row[1]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    results.loc[len(results)] = results.sum(numeric_only=True, axis=0)
    results['session_type_desc'] = results['session_type_desc'].fillna('Total')
    results.sort_values(by='No Sesiones',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    results.rename(columns={'session_type_desc':'Sesión'}, inplace=True)
    return results
