# Modules needed
import pandas as pd
import numpy as np
from flask_sqlalchemy import SQLAlchemy
#import sqlalchemy
#from sqlalchemy.ext.automap import automap_base
#from sqlalchemy.orm import Session
#from sqlalchemy.orm import sessionmaker
#from sqlalchemy import create_engine, func, inspect, and_
import os
import glob
import datetime
import calendar

# import variables from config file
from config import appConfig

#connection = appConfig['default'].SQLALCHEMY_DATABASE_URI
print('Loading API')

# Get user from user id
def getUserFromId(_user_id, db_):
    rs = db_.engine_execute(f'SELECT *  FROM public."Member" WHERE user_id = {_user_id}')
    user = {}
    for row in rs:
        user['id'] = row[0]
        user['name'] = row[1]
    return user

def getAllResults(_member,_year,db_):
    rs = db_.engine.execute(f'SELECT COALESCE(member_desc,\'{_member}\'), yr, mm,  COALESCE(NoPart,0) FROM ( 	SELECT   	m.member_desc,   	(Extract(Year from session_dt)) as Anio,   	(Extract(Month from session_dt)) as Mes,   	count(*) as NoPart   	FROM public."Session" s   	JOIN public."Member" m   		ON m.member_id = s.member_id   	WHERE m.member_desc like \'{_member}\'  	AND (Extract(Year from session_dt)) = {_year}   	AND "isGuest" = FALSE   	GROUP BY (Extract(Year from session_dt)),   	(Extract(Month from session_dt)),   	m.member_desc  ) dta RIGHT OUTER JOIN period_vw srs 	ON srs.yr = Anio 	AND srs.mm = Mes WHERE srs.yr = {_year}    ')
    dicts = []
    for row in rs:
        d = {}
        d['Socio'] = row[0]
        d['Año'] = row[1]
        d['Mes'] = row[2]
        d['NoParticipaciones'] = row[3]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    return results


def getResultsPerMember(_member,_year, db_):
    rs = db_.engine.execute(f' Select  rt.role_type_desc,  count(*) as NoPart  from public."Session" s   JOIN public."Member" m  	ON m.member_id = s.member_id  JOIN public."Role" r  	ON r.role_id = s.role_id   JOIN public."Role_Type" rt   	ON r.role_type_id = rt.role_type_id  WHERE m.member_desc = \'{_member}\'      AND (Extract(Year from session_dt)) = {_year}  AND "isGuest" = FALSE  GROUP BY  rt.role_type_desc order by count(*) asc        ')
    dicts = []
    for row in rs:
        d = {}
        d['TipoRol'] = row[0]
        d['NoParticipaciones'] = row[1]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    # Calculate percentages
    total = sum(results['NoParticipaciones'])
    results["Perc"] = results['NoParticipaciones'] / total*100
    results['Perc'] = results['Perc'].round(2)
    return results

# Get information for each member
def getDetailedResultsPerMember(_member,_year, db_):
    rs = db_.engine.execute(f' SELECT COALESCE(member_desc,\'{_member}\'), yr, mm,  COALESCE(role_type_desc,\'Equipo Evaluación\'), COALESCE(NoPart,0) FROM ( 	SELECT m.member_desc,  (Extract(Year from session_dt)) as Anio,  (Extract(Month from session_dt)) as Mes,  r.role_desc,  rt.role_type_desc,  COUNT(*) as NoPart  FROM public."Session" s  LEFT JOIN public."Member" m  	ON m.member_id = s.member_id  LEFT JOIN public."Role" r  	ON r.role_id = s.role_id  LEFT JOIN public."Role_Type" rt  	ON r.role_type_id = rt.role_type_id  WHERE  (Extract(Year from session_dt)) = {_year} AND m.member_desc = \'{_member}\'  GROUP BY (Extract(Year from session_dt)), (Extract(Month from session_dt)), r.role_desc, rt.role_type_desc, m.member_desc ) dta RIGHT OUTER JOIN period_vw srs 	ON srs.yr = Anio 	AND srs.mm = Mes WHERE srs.yr = {_year} ')
    #rs = db_.engine.execute(f' SELECT COALESCE(member_desc,\'{_member}\'), yr, mm,  COALESCE(role_desc,\'Evaluador\'), COALESCE(role_type_desc,\'Equipo Evaluación\'), COALESCE(NoPart,0) FROM ( 	SELECT m.member_desc,  (Extract(Year from session_dt)) as Anio,  (Extract(Month from session_dt)) as Mes,  r.role_desc,  rt.role_type_desc,  COUNT(*) as NoPart  FROM public."Session" s  LEFT JOIN public."Member" m  	ON m.member_id = s.member_id  LEFT JOIN public."Role" r  	ON r.role_id = s.role_id  LEFT JOIN public."Role_Type" rt  	ON r.role_type_id = rt.role_type_id  WHERE  (Extract(Year from session_dt)) = {_year} AND m.member_desc = \'{_member}\'  GROUP BY (Extract(Year from session_dt)), (Extract(Month from session_dt)), r.role_desc, rt.role_type_desc, m.member_desc ) dta RIGHT OUTER JOIN period_vw srs 	ON srs.yr = Anio 	AND srs.mm = Mes WHERE srs.yr = {_year} ')
    dicts = []
    for row in rs:
        d = {}
        d['Socio'] = row[0]
        d['Año'] = row[1]
        d['Mes'] = row[2]
        d['TipoRol'] = row[3]
        #d['Rol'] = row[4]
        d['Participaciones'] = row[4]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    results = results.pivot_table(values='Participaciones',index=[results.TipoRol],columns='Mes',aggfunc='sum', dropna=True)
    #results = results.pivot_table(values='Participaciones',index=[results.Rol,results.TipoRol],columns='Mes',aggfunc='sum', dropna=True)
    results.loc[:,'Total'] = results.sum(axis=1)
    #results.sort_values(by='Total',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    #results.rename(columns={'member_desc':'Socios'}, inplace=True)
    return results

# Get monthly stats for only members of the club
def getResultsPerDateRange(year_, month_, db_):
    
    
    num_days = calendar.monthrange(year_, month_)[1]
    start_date = datetime.date(year_, month_, 1)
    end_date = datetime.date(year_, month_, num_days)
    start_date = f"'{start_date}'"
    end_date = f"'{end_date}'"
    result = db_.engine.execute(f'Select  m.member_desc, r.Role_desc, count(session_dt) as NoParticipations from public."Session" s JOIN public."Member" m ON m.member_id = s.member_id JOIN public."Role" r ON r.role_id = s.role_id WHERE session_dt >= {start_date} AND session_dt <= {end_date} and "isGuest" = FALSE GROUP BY m.member_desc, r.role_desc ')
    #result = session.query(Member.member_desc, Role.role_desc, func.count(Session2.session_dt).label('NoParticipations')).join(Member,Session2.member_id==Member.member_id).join(Role, Session2.role_id == Role.role_id).filter(and_(Session2.session_dt >= start_date, Session2.session_dt <= end_date )).group_by(Member.member_desc,Role.role_desc).all()
    dicts = []

    for row in result:
        d = {}
        d['member_desc'] = row[0]
        d['role_desc'] = row[1]
        d['NoParticipations'] = row[2]
        dicts.append(d)

    results = pd.DataFrame(dicts)
    results = results.pivot_table(values='NoParticipations',index=[results.member_desc],columns='role_desc',aggfunc='sum', dropna=True)
    #results.reset_index(inplace=True)
    results.loc[:,'Total'] = results.sum(axis=1)
    results.sort_values(by='Total',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    results.rename(columns={'member_desc':'Socios'}, inplace=True)
    
    
    return results

# Get monthly stats per club (only ibcluding members)
def getStatsPerDateRange(year_, month_, db_):
    rs = db_.engine.execute(f'Select extract(month from session_dt) as Month_Desc, count(*) as Participations, count(distinct s.member_id) as Members, count(distinct session_dt) as Sessions from public."Session" s JOIN public."Member" m 	On s.member_id = m.member_id where extract(month from session_dt) = {month_} and extract(year from session_dt) = {year_} and "isGuest" = FALSE group by extract(month from session_dt) ')
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

# Get all the accumulated stats for only members in the club
def getStatsPerYear(year_,db_):
    try:
        rs = db_.engine.execute(f'Select m.member_id, m.member_desc, rt.role_type_desc, count(*) as NoParticipations FROM public."Session" s JOIN public."Member" m On m.member_id = s.member_id JOIN public."Role" r On s.role_id = r.role_id JOIN public."Role_Type" rt On r.role_type_id = rt.role_type_id where extract(year from (session_dt)) = {year_} and "isGuest" = FALSE group by m.member_id, m.member_desc, rt.role_type_desc order by m.member_id, count(*) desc ')
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
        results['Disc %'] = (results['Discurso'] / results['Total'])*100
        results['Disc %'] = results['Disc %'].round(0)
        results['Com %'] = (results['Comunicador'] / results['Total'])*100
        results['Com %'] = results['Com %'].round(0)
        results['Eva %'] = (results['Equipo Evaluación'] / results['Total'])*100
        results['Eva %'] = results['Eva %'].round(0)
        results['Lid %'] = (results['Liderazgo'] / results['Total'])*100
        results['Lid %'] = results['Lid %'].round(0)
        results.sort_values(by='Total',ascending=False,inplace=True)
        results.reset_index(inplace=True)
        results = results[['member_desc','Discurso','Disc %','Comunicador','Com %','Equipo Evaluación','Eva %','Liderazgo','Lid %','Total']]
        results.rename(columns={'role_type_desc':'Rol'}, inplace=True)
        results.rename(columns={'member_desc':'Socios'}, inplace=True)
    # No available results
    except AttributeError:
        results = {}
    return results

# get monthly stats per club for only members of BIAM club
def getStatsPerClub(year_,db_):
    rs = db_.engine.execute(f'SELECT c.club_desc, count(distinct m.member_id) FROM public."Session" s JOIN public."Member" m 	ON m.member_id = s.member_id JOIN public."Club" c 	ON m.club_id = c.club_id where extract(year from (session_dt)) = {year_} and "isGuest" = FALSE group by c.club_desc order by count(distinct m.member_id) desc')
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

# Get monthly stats per club according to the type of session
def getStatsPerSessionType(year_,db_):
    rs = db_.engine.execute(f'Select distinct session_type_desc, count(distinct session_dt)  from public."Session" s  JOIN public."Session_Type" st  	on st.session_type_id = s.session_type_id  WHERE EXTRACT(YEAR FROM (session_dt)) = {year_} and "isGuest" = FALSE  group by session_type_desc  order by count(distinct session_dt) desc')
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

# Display only members with at least 1 participation
def getActiveMembers(_year, db_):
    rs = db_.engine.execute(f'Select m.member_desc, count(*) as participations from public."Session" s JOIN public."Member" m  ON m.member_id = s.member_id where (Extract(Year from session_dt)) = {_year} and "isGuest" = FALSE group by m.member_desc having count(*) > 1 order by m.member_desc')
    dicts = []
    for row in rs:
        d = {}
        d['Socio'] = row[0]
        d['Participaciones'] = row[1]
        dicts.append(d)
    results = pd.DataFrame(dicts)
    #results = results.pivot_table(values='Participaciones',index=[results.Rol,results.TipoRol],columns='Mes',aggfunc='sum', dropna=True)
    #results.loc[:,'Total'] = results.sum(axis=1)
    #results.sort_values(by='Total',ascending=False,inplace=True)
    results.reset_index(inplace=True)
    #results.rename(columns={'member_desc':'Socios'}, inplace=True)
    return results
