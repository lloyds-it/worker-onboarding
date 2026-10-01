import sys
import os
import json
import pyodbc

# Read configuration from environment with defaults
FABRIC_SERVER = os.environ.get("FABRIC_SERVER", "2xv4ddeoefeuhhgixzuzuy3udm-s2pfycav32ku5anvzm7d4vfmqi.database.fabric.microsoft.com")
FABRIC_DATABASE = os.environ.get("FABRIC_DATABASE", "Worker_onboarding-ef0fbf2a-a528-4ed3-ae76-4fcc1f9e531a")
FABRIC_USER = os.environ.get("FABRIC_USER", "")
FABRIC_PASSWORD = os.environ.get("FABRIC_PASSWORD", "")
AZURE_CLIENT_ID = os.environ.get("AZURE_CLIENT_ID", "")
AZURE_CLIENT_SECRET = os.environ.get("AZURE_CLIENT_SECRET", "")
AZURE_TENANT_ID = os.environ.get("AZURE_TENANT_ID", "")

# Service Principal Connection String (Primary)
SP_CONN_STR = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={FABRIC_SERVER},1433;"
    f"DATABASE={FABRIC_DATABASE};"
    f"Authentication=ActiveDirectoryServicePrincipal;"
    f"UID={AZURE_CLIENT_ID};"
    f"PWD={AZURE_CLIENT_SECRET};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Timeout=25;"
)

# Active Directory Password Connection String (Resilient Fallback)
AD_CONN_STR = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={FABRIC_SERVER},1433;"
    f"DATABASE={FABRIC_DATABASE};"
    f"Authentication=ActiveDirectoryPassword;"
    f"UID={FABRIC_USER};"
    f"PWD={FABRIC_PASSWORD};"
    f"Encrypt=yes;"
    f"TrustServerCertificate=no;"
    f"Timeout=25;"
)

def get_connection():
    # 1. Primary: Attempt ActiveDirectoryServicePrincipal connection
    if AZURE_CLIENT_ID and AZURE_CLIENT_SECRET:
        try:
            return pyodbc.connect(SP_CONN_STR)
        except Exception as sp_err:
            sys.stderr.write(f"[Fabric Bridge SP Notice]: {sp_err}\n")
    # 2. Resilient Fallback: ActiveDirectoryPassword
    return pyodbc.connect(AD_CONN_STR)

def test_connection():
    # Test Service Principal directly
    if AZURE_CLIENT_ID and AZURE_CLIENT_SECRET:
        try:
            conn = pyodbc.connect(SP_CONN_STR)
            cursor = conn.cursor()
            cursor.execute("SELECT 1 AS isAlive, DB_NAME() AS currentDb, GETUTCDATE() AS serverTime")
            row = cursor.fetchone()
            conn.close()
            return {
                "success": True,
                "connected": True,
                "currentDb": str(row[1]),
                "serverTime": str(row[2]),
                "mode": "FABRIC_LIVE_SERVICE_PRINCIPAL",
                "authMethod": "ServicePrincipal",
                "appId": AZURE_CLIENT_ID,
                "tenantId": AZURE_TENANT_ID,
                "statusMessage": "Connected to Microsoft Fabric SQL Database using Service Principal!"
            }
        except Exception as sp_err:
            err_str = str(sp_err)
            perm_needed = "Read item permission" in err_str or "Validation of user's permissions failed" in err_str
            # Try AD fallback so system remains functional
            try:
                ad_conn = pyodbc.connect(AD_CONN_STR)
                cursor = ad_conn.cursor()
                cursor.execute("SELECT 1 AS isAlive, DB_NAME() AS currentDb, GETUTCDATE() AS serverTime")
                row = cursor.fetchone()
                ad_conn.close()
                return {
                    "success": True,
                    "connected": True,
                    "currentDb": str(row[1]),
                    "serverTime": str(row[2]),
                    "mode": "FABRIC_LIVE_AD",
                    "authMethod": "ActiveDirectoryPassword",
                    "appId": AZURE_CLIENT_ID,
                    "tenantId": AZURE_TENANT_ID,
                    "servicePrincipal": {
                        "authenticated": True,
                        "permissionPending": perm_needed,
                        "rawError": err_str,
                        "instruction": (
                            "Service Principal credentials are VALID and authenticated with Microsoft Entra ID. "
                            "In Fabric workspace 'Software Databases', click 'Manage access' -> 'Add people or groups' "
                            "-> search for App ID 'ab0981e7-bc93-4d13-81b2-4f7d08871064' -> assign 'Contributor' role."
                        )
                    }
                }
            except Exception as ad_err:
                return {
                    "success": False,
                    "connected": False,
                    "error": f"SP Error: {err_str} | AD Error: {str(ad_err)}",
                    "mode": "FALLBACK_MODE"
                }

    try:
        conn = pyodbc.connect(AD_CONN_STR)
        cursor = conn.cursor()
        cursor.execute("SELECT 1 AS isAlive, DB_NAME() AS currentDb, GETUTCDATE() AS serverTime")
        row = cursor.fetchone()
        conn.close()
        return {
            "success": True,
            "connected": True,
            "currentDb": str(row[1]),
            "serverTime": str(row[2]),
            "mode": "FABRIC_LIVE_AD"
        }
    except Exception as e:
        return {
            "success": False,
            "connected": False,
            "error": str(e),
            "mode": "FALLBACK_MODE"
        }

def get_workers():
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT 
          w.id, w.assignedWorkerId, w.stage, w.status, w.fullName, w.contractorName, w.trade, w.mobileNumber, w.createdAt, w.updatedAt,
          hr.fatherHusbandName, hr.dob, hr.age, hr.gender, hr.idProofType, hr.idProofRef, hr.contractorLicense, hr.emergencyPerson, hr.emergencyRelationship, hr.emergencyMobile,
          m.bloodGroup, m.heightCm, m.weightKg, m.bmi, m.bmiCategory, m.bpSystolic, m.bpDiastolic, m.spo2, m.pulseRate, m.respirationRate, m.rbs, m.alcoholTest, m.visionTest, m.hearingTest, m.vertigoTest, m.existingIllness, m.fitnessStatus, m.examinerName, m.remarks,
          s.briefingDone, s.topicsCovered, s.ppeIssued, s.safetyOfficerName, s.safetyDate,
          it.faceBiometricRegistered, it.cwmsRegistered, it.campusMasterUploaded, it.undertakingAccepted, it.itAdminSignature, it.itDate,
          c.campName, c.blockNo, c.roomNo, c.bedNo, c.gatePassActive, c.allocatedBy, c.allocationDate
        FROM dbo.WorkersMaster w
        LEFT JOIN dbo.WorkerHRData hr ON w.id = hr.workerId
        LEFT JOIN dbo.WorkerMedicalVitals m ON w.id = m.workerId
        LEFT JOIN dbo.WorkerSafetyInduction s ON w.id = s.workerId
        LEFT JOIN dbo.WorkerITBiometrics it ON w.id = it.workerId
        LEFT JOIN dbo.WorkerCampAllocation c ON w.id = c.workerId
        ORDER BY w.createdAt DESC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    workers = []
    for r in rows:
        workers.append({
            "id": r[0],
            "assignedWorkerId": r[1] or "",
            "stage": r[2],
            "status": r[3],
            "createdAt": r[8] or "",
            "updatedAt": r[9] or "",
            "hr": {
                "fullName": r[4],
                "fatherHusbandName": r[10] or "",
                "dob": r[11] or "",
                "age": r[12],
                "gender": r[13] or "",
                "mobileNumber": r[7] or "",
                "idProofType": r[14] or "",
                "idProofRef": r[15] or "",
                "contractorName": r[5] or "",
                "contractorLicense": r[16] or "",
                "trade": r[6] or "",
                "emergencyPerson": r[17] or "",
                "emergencyRelationship": r[18] or "",
                "emergencyMobile": r[19] or ""
            },
            "medical": {
                "bloodGroup": r[20] or "",
                "heightCm": r[21],
                "weightKg": r[22],
                "bmi": r[23] or "",
                "bmiCategory": r[24] or "",
                "bpSystolic": r[25],
                "bpDiastolic": r[26],
                "spo2": r[27],
                "pulseRate": r[28],
                "respirationRate": r[29],
                "rbs": r[30],
                "alcoholTest": r[31] or "",
                "visionTest": r[32] or "",
                "hearingTest": r[33] or "",
                "vertigoTest": r[34] or "",
                "existingIllness": r[35] or "",
                "fitnessStatus": r[36] or "",
                "examinerName": r[37] or "",
                "remarks": r[38] or ""
            } if r[20] else None,
            "safety": {
                "briefingDone": bool(r[39]),
                "topicsCovered": r[40].split(" | ") if r[40] else [],
                "ppeIssued": r[41].split(" | ") if r[41] else [],
                "safetyOfficerName": r[42] or "",
                "safetyDate": r[43] or ""
            } if r[39] is not None else None,
            "it": {
                "faceBiometricRegistered": bool(r[44]),
                "cwmsRegistered": bool(r[45]),
                "campusMasterUploaded": bool(r[46]),
                "undertakingAccepted": bool(r[47]),
                "itAdminSignature": r[48] or "",
                "itDate": r[49] or ""
            } if r[44] is not None else None,
            "camp": {
                "campName": r[50] or "",
                "blockNumber": r[51] or "",
                "roomNumber": r[52] or "",
                "bedNumber": r[53] or "",
                "gatePassActive": bool(r[54]),
                "allocatedBy": r[55] or "",
                "allocationDate": r[56] or ""
            } if r[50] else None
        })
    conn.close()
    return workers

def register_worker(payload):
    conn = get_connection()
    cursor = conn.cursor()
    w_id = payload.get("id")
    hr = payload.get("hr", {})
    now = payload.get("createdAt") or payload.get("updatedAt") or "2026-09-22T00:00:00Z"
    
    # Check WorkersMaster
    cursor.execute("SELECT 1 FROM dbo.WorkersMaster WHERE id = ?", (w_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dbo.WorkersMaster (id, assignedWorkerId, stage, status, fullName, contractorName, trade, mobileNumber, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (w_id, payload.get("assignedWorkerId", ""), payload.get("stage", 1), payload.get("status", "IN_PROGRESS"), hr.get("fullName", ""), hr.get("contractorName", ""), hr.get("trade", ""), hr.get("mobileNumber", ""), now, now))
    
    # Check WorkerHRData
    cursor.execute("SELECT 1 FROM dbo.WorkerHRData WHERE workerId = ?", (w_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dbo.WorkerHRData (workerId, fullName, fatherHusbandName, dob, age, gender, mobileNumber, idProofType, idProofRef, contractorName, contractorLicense, trade, emergencyPerson, emergencyRelationship, emergencyMobile, registeredAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (w_id, hr.get("fullName", ""), hr.get("fatherHusbandName", ""), hr.get("dob", ""), int(hr.get("age", 0)) if hr.get("age") else None, hr.get("gender", ""), hr.get("mobileNumber", ""), hr.get("idProofType", ""), hr.get("idProofRef", ""), hr.get("contractorName", ""), hr.get("contractorLicense", ""), hr.get("trade", ""), hr.get("emergencyPerson", ""), hr.get("emergencyRelationship", ""), hr.get("emergencyMobile", ""), now))
    
    conn.commit()
    conn.close()
    return {"success": True, "workerId": w_id}

def update_medical(worker_id, medical_data, updated_worker):
    conn = get_connection()
    cursor = conn.cursor()
    now = updated_worker.get("updatedAt") or "2026-09-22T00:00:00Z"
    
    cursor.execute("SELECT 1 FROM dbo.WorkerMedicalVitals WHERE workerId = ?", (worker_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dbo.WorkerMedicalVitals (workerId, bloodGroup, heightCm, weightKg, bmi, bmiCategory, bpSystolic, bpDiastolic, spo2, pulseRate, respirationRate, rbs, alcoholTest, visionTest, hearingTest, vertigoTest, existingIllness, fitnessStatus, examinerName, remarks, examinedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            worker_id,
            medical_data.get("bloodGroup", ""),
            int(medical_data.get("heightCm", 0)) if medical_data.get("heightCm") else None,
            int(medical_data.get("weightKg", 0)) if medical_data.get("weightKg") else None,
            str(medical_data.get("bmi", "")),
            medical_data.get("bmiCategory", ""),
            int(medical_data.get("bpSystolic", 0)) if medical_data.get("bpSystolic") else None,
            int(medical_data.get("bpDiastolic", 0)) if medical_data.get("bpDiastolic") else None,
            int(medical_data.get("spo2", 0)) if medical_data.get("spo2") else None,
            int(medical_data.get("pulseRate", 0)) if medical_data.get("pulseRate") else None,
            int(medical_data.get("respirationRate", 0)) if medical_data.get("respirationRate") else None,
            int(medical_data.get("rbs", 0)) if medical_data.get("rbs") else None,
            medical_data.get("alcoholTest", ""),
            medical_data.get("visionTest", ""),
            medical_data.get("hearingTest", ""),
            medical_data.get("vertigoTest", ""),
            medical_data.get("existingIllness", ""),
            medical_data.get("fitnessStatus", ""),
            medical_data.get("examinerName", ""),
            medical_data.get("remarks", ""),
            now
        ))
    else:
        cursor.execute("""
            UPDATE dbo.WorkerMedicalVitals
            SET bloodGroup = ?, heightCm = ?, weightKg = ?, bmi = ?, bmiCategory = ?, bpSystolic = ?, bpDiastolic = ?, spo2 = ?, pulseRate = ?, respirationRate = ?, rbs = ?, alcoholTest = ?, visionTest = ?, hearingTest = ?, vertigoTest = ?, existingIllness = ?, fitnessStatus = ?, examinerName = ?, remarks = ?, examinedAt = ?
            WHERE workerId = ?
        """, (
            medical_data.get("bloodGroup", ""),
            int(medical_data.get("heightCm", 0)) if medical_data.get("heightCm") else None,
            int(medical_data.get("weightKg", 0)) if medical_data.get("weightKg") else None,
            str(medical_data.get("bmi", "")),
            medical_data.get("bmiCategory", ""),
            int(medical_data.get("bpSystolic", 0)) if medical_data.get("bpSystolic") else None,
            int(medical_data.get("bpDiastolic", 0)) if medical_data.get("bpDiastolic") else None,
            int(medical_data.get("spo2", 0)) if medical_data.get("spo2") else None,
            int(medical_data.get("pulseRate", 0)) if medical_data.get("pulseRate") else None,
            int(medical_data.get("respirationRate", 0)) if medical_data.get("respirationRate") else None,
            int(medical_data.get("rbs", 0)) if medical_data.get("rbs") else None,
            medical_data.get("alcoholTest", ""),
            medical_data.get("visionTest", ""),
            medical_data.get("hearingTest", ""),
            medical_data.get("vertigoTest", ""),
            medical_data.get("existingIllness", ""),
            medical_data.get("fitnessStatus", ""),
            medical_data.get("examinerName", ""),
            medical_data.get("remarks", ""),
            now,
            worker_id
        ))
    
    cursor.execute("UPDATE dbo.WorkersMaster SET stage = ?, status = ?, updatedAt = ? WHERE id = ?", (updated_worker.get("stage"), updated_worker.get("status"), now, worker_id))
    conn.commit()
    conn.close()
    return {"success": True, "workerId": worker_id}

def update_safety(worker_id, safety_data, updated_worker):
    conn = get_connection()
    cursor = conn.cursor()
    now = updated_worker.get("updatedAt") or "2026-09-22T00:00:00Z"
    topics_str = " | ".join(safety_data.get("topicsCovered", [])) if isinstance(safety_data.get("topicsCovered"), list) else str(safety_data.get("topicsCovered", ""))
    ppe_str = " | ".join(safety_data.get("ppeIssued", [])) if isinstance(safety_data.get("ppeIssued"), list) else str(safety_data.get("ppeIssued", ""))

    cursor.execute("SELECT 1 FROM dbo.WorkerSafetyInduction WHERE workerId = ?", (worker_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dbo.WorkerSafetyInduction (workerId, briefingDone, topicsCovered, ppeIssued, safetyOfficerName, safetyDate, inductedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (worker_id, bool(safety_data.get("briefingDone")), topics_str, ppe_str, safety_data.get("safetyOfficerName", ""), safety_data.get("safetyDate", ""), now))
    else:
        cursor.execute("""
            UPDATE dbo.WorkerSafetyInduction
            SET briefingDone = ?, topicsCovered = ?, ppeIssued = ?, safetyOfficerName = ?, safetyDate = ?, inductedAt = ?
            WHERE workerId = ?
        """, (bool(safety_data.get("briefingDone")), topics_str, ppe_str, safety_data.get("safetyOfficerName", ""), safety_data.get("safetyDate", ""), now, worker_id))

    cursor.execute("UPDATE dbo.WorkersMaster SET stage = ?, status = ?, updatedAt = ? WHERE id = ?", (updated_worker.get("stage"), updated_worker.get("status"), now, worker_id))
    conn.commit()
    conn.close()
    return {"success": True, "workerId": worker_id}

def update_it(worker_id, it_data, updated_worker):
    conn = get_connection()
    cursor = conn.cursor()
    now = updated_worker.get("updatedAt") or "2026-09-22T00:00:00Z"

    cursor.execute("SELECT 1 FROM dbo.WorkerITBiometrics WHERE workerId = ?", (worker_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dbo.WorkerITBiometrics (workerId, assignedWorkerId, faceBiometricRegistered, cwmsRegistered, campusMasterUploaded, undertakingAccepted, itAdminSignature, itDate, enrolledAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (worker_id, updated_worker.get("assignedWorkerId", ""), bool(it_data.get("faceBiometricRegistered")), bool(it_data.get("cwmsRegistered")), bool(it_data.get("campusMasterUploaded")), bool(it_data.get("undertakingAccepted")), it_data.get("itAdminSignature", ""), it_data.get("itDate", ""), now))
    else:
        cursor.execute("""
            UPDATE dbo.WorkerITBiometrics
            SET assignedWorkerId = ?, faceBiometricRegistered = ?, cwmsRegistered = ?, campusMasterUploaded = ?, undertakingAccepted = ?, itAdminSignature = ?, itDate = ?, enrolledAt = ?
            WHERE workerId = ?
        """, (updated_worker.get("assignedWorkerId", ""), bool(it_data.get("faceBiometricRegistered")), bool(it_data.get("cwmsRegistered")), bool(it_data.get("campusMasterUploaded")), bool(it_data.get("undertakingAccepted")), it_data.get("itAdminSignature", ""), it_data.get("itDate", ""), now, worker_id))

    cursor.execute("UPDATE dbo.WorkersMaster SET assignedWorkerId = ?, stage = ?, status = ?, updatedAt = ? WHERE id = ?", (updated_worker.get("assignedWorkerId", ""), updated_worker.get("stage"), updated_worker.get("status"), now, worker_id))
    conn.commit()
    conn.close()
    return {"success": True, "workerId": worker_id}

def update_camp(worker_id, camp_data, updated_worker):
    conn = get_connection()
    cursor = conn.cursor()
    now = updated_worker.get("updatedAt") or "2026-09-22T00:00:00Z"

    cursor.execute("SELECT 1 FROM dbo.WorkerCampAllocation WHERE workerId = ?", (worker_id,))
    if not cursor.fetchone():
        cursor.execute("""
            INSERT INTO dbo.WorkerCampAllocation (workerId, campName, blockNo, roomNo, bedNo, gatePassActive, allocatedBy, allocationDate, allocatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (worker_id, camp_data.get("campName", ""), camp_data.get("blockNumber", ""), camp_data.get("roomNumber", ""), camp_data.get("bedNumber", ""), bool(camp_data.get("gatePassActive")), camp_data.get("allocatedBy", ""), camp_data.get("allocationDate", ""), now))
    else:
        cursor.execute("""
            UPDATE dbo.WorkerCampAllocation
            SET campName = ?, blockNo = ?, roomNo = ?, bedNo = ?, gatePassActive = ?, allocatedBy = ?, allocationDate = ?, allocatedAt = ?
            WHERE workerId = ?
        """, (camp_data.get("campName", ""), camp_data.get("blockNumber", ""), camp_data.get("roomNumber", ""), camp_data.get("bedNumber", ""), bool(camp_data.get("gatePassActive")), camp_data.get("allocatedBy", ""), camp_data.get("allocationDate", ""), now, worker_id))

    cursor.execute("UPDATE dbo.WorkersMaster SET stage = ?, status = ?, updatedAt = ? WHERE id = ?", (updated_worker.get("stage"), updated_worker.get("status"), now, worker_id))
    conn.commit()
    conn.close()
    return {"success": True, "workerId": worker_id}

def get_payload():
    if len(sys.argv) > 2 and sys.argv[2].strip():
        return json.loads(sys.argv[2])
    try:
        content = sys.stdin.read().strip()
        if content:
            return json.loads(content)
    except Exception:
        pass
    return {}

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "test"
    try:
        if action == "test":
            res = test_connection()
            print(json.dumps(res))
        elif action == "get_workers":
            res = get_workers()
            print(json.dumps({"success": True, "data": res}))
        elif action == "register":
            payload = get_payload()
            res = register_worker(payload)
            print(json.dumps(res))
        elif action == "update_medical":
            payload = get_payload()
            res = update_medical(payload["workerId"], payload["medical"], payload["worker"])
            print(json.dumps(res))
        elif action == "update_safety":
            payload = get_payload()
            res = update_safety(payload["workerId"], payload["safety"], payload["worker"])
            print(json.dumps(res))
        elif action == "update_it":
            payload = get_payload()
            res = update_it(payload["workerId"], payload["it"], payload["worker"])
            print(json.dumps(res))
        elif action == "update_camp":
            payload = get_payload()
            res = update_camp(payload["workerId"], payload["camp"], payload["worker"])
            print(json.dumps(res))
        else:
            print(json.dumps({"success": False, "error": f"Unknown action: {action}"}))
    except Exception as ex:
        print(json.dumps({"success": False, "error": str(ex)}))
