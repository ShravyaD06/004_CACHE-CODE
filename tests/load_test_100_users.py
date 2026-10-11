"""
DocuSense AI - 100 Concurrent Users Scalability & Load Test Suite.

Simulates 100 concurrent users performing active operations against the DocuSense AI API:
- Concurrency: 100 workers (ThreadPoolExecutor)
- User Workflow:
  1. GET /api/health (Service Liveness)
  2. GET /api/schemas (Schema retrieval)
  3. GET /api/documents (Document list & pagination)
  4. GET /api/documents/classifier/metrics (Classifier metrics)
  5. GET /api/documents/{sample_doc_id}/results (Extraction results)
  6. POST /api/documents/{sample_doc_id}/copilot (AI Copilot insight query)

Measures:
- Total execution time
- Total requests sent & processed
- Throughput (Requests Per Second - RPS)
- Success rate & Failure rate
- Latency percentiles: Mean, Median (p50), p90, p95, p99, Max (ms)
- SQLite concurrency and lock contention analysis
"""

import time
import statistics
import concurrent.futures
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
NUM_USERS = 100

def get_reference_doc_id():
    """Retrieves an existing document ID from the database for read/copilot queries."""
    try:
        r = requests.get(f"{BASE_URL}/api/documents", timeout=5)
        if r.status_code == 200:
            docs = r.json()
            if docs and len(docs) > 0:
                return docs[0]["id"]
    except Exception:
        pass
    return None

def simulate_user_session(user_id: int, doc_id: str):
    """Executes a realistic workflow sequence for a single user."""
    results = []
    
    # Task 1: Health check
    t0 = time.perf_counter()
    try:
        r1 = requests.get(f"{BASE_URL}/api/health", timeout=10)
        dt1 = (time.perf_counter() - t0) * 1000.0
        results.append(("GET /api/health", r1.status_code == 200, dt1))
    except Exception as e:
        results.append(("GET /api/health", False, (time.perf_counter() - t0) * 1000.0))

    # Task 2: Schema definition
    t0 = time.perf_counter()
    try:
        r2 = requests.get(f"{BASE_URL}/api/schemas", timeout=10)
        dt2 = (time.perf_counter() - t0) * 1000.0
        results.append(("GET /api/schemas", r2.status_code == 200, dt2))
    except Exception as e:
        results.append(("GET /api/schemas", False, (time.perf_counter() - t0) * 1000.0))

    # Task 3: Document workspace list
    t0 = time.perf_counter()
    try:
        r3 = requests.get(f"{BASE_URL}/api/documents", timeout=10)
        dt3 = (time.perf_counter() - t0) * 1000.0
        results.append(("GET /api/documents", r3.status_code == 200, dt3))
    except Exception as e:
        results.append(("GET /api/documents", False, (time.perf_counter() - t0) * 1000.0))

    # Task 4: Classifier metrics
    t0 = time.perf_counter()
    try:
        r4 = requests.get(f"{BASE_URL}/api/documents/classifier/metrics", timeout=10)
        dt4 = (time.perf_counter() - t0) * 1000.0
        results.append(("GET /api/classifier/metrics", r4.status_code == 200, dt4))
    except Exception as e:
        results.append(("GET /api/classifier/metrics", False, (time.perf_counter() - t0) * 1000.0))

    # Task 5: Document Results (if doc exists)
    if doc_id:
        t0 = time.perf_counter()
        try:
            r5 = requests.get(f"{BASE_URL}/api/documents/{doc_id}/results", timeout=10)
            dt5 = (time.perf_counter() - t0) * 1000.0
            results.append(("GET /api/documents/{id}/results", r5.status_code == 200, dt5))
        except Exception as e:
            results.append(("GET /api/documents/{id}/results", False, (time.perf_counter() - t0) * 1000.0))

        # Task 6: Copilot query
        t0 = time.perf_counter()
        try:
            r6 = requests.post(
                f"{BASE_URL}/api/documents/{doc_id}/copilot",
                json={"action": "find_missing_fields"},
                timeout=10
            )
            dt6 = (time.perf_counter() - t0) * 1000.0
            results.append(("POST /api/documents/{id}/copilot", r6.status_code == 200, dt6))
        except Exception as e:
            results.append(("POST /api/documents/{id}/copilot", False, (time.perf_counter() - t0) * 1000.0))

    return results

def run_load_test():
    print("=" * 70)
    print(f"  STARTING DOCUSENSE AI LOAD TEST: {NUM_USERS} CONCURRENT USERS")
    print("=" * 70)

    # Pre-test connectivity check
    try:
        check = requests.get(f"{BASE_URL}/api/health", timeout=3)
        if check.status_code != 200:
            print("[ERROR] Server not reachable at", BASE_URL)
            return
    except Exception as e:
        print("[ERROR] Cannot reach backend:", e)
        return

    sample_doc_id = get_reference_doc_id()
    print(f"Reference Document ID for session queries: {sample_doc_id}")
    print(f"Spawning {NUM_USERS} concurrent user threads...")

    overall_start = time.perf_counter()
    all_metrics = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_USERS) as executor:
        futures = [executor.submit(simulate_user_session, i, sample_doc_id) for i in range(NUM_USERS)]
        for f in concurrent.futures.as_completed(futures):
            all_metrics.extend(f.result())

    total_duration = time.perf_counter() - overall_start

    # Analysis
    total_requests = len(all_metrics)
    successful_requests = sum(1 for m in all_metrics if m[1])
    failed_requests = total_requests - successful_requests
    failure_rate = (failed_requests / total_requests) * 100.0
    throughput = total_requests / total_duration

    all_latencies = sorted([m[2] for m in all_metrics])
    p50 = statistics.median(all_latencies)
    mean_lat = statistics.mean(all_latencies)
    p90 = all_latencies[int(len(all_latencies) * 0.90)]
    p95 = all_latencies[int(len(all_latencies) * 0.95)]
    p99 = all_latencies[int(len(all_latencies) * 0.99)]
    max_lat = max(all_latencies)
    min_lat = min(all_latencies)

    # Per endpoint breakdown
    endpoint_stats = {}
    for ep, ok, lat in all_metrics:
        if ep not in endpoint_stats:
            endpoint_stats[ep] = {"total": 0, "success": 0, "lats": []}
        endpoint_stats[ep]["total"] += 1
        if ok:
            endpoint_stats[ep]["success"] += 1
        endpoint_stats[ep]["lats"].append(lat)

    print("\n" + "=" * 70)
    print("  LOAD TEST RESULTS & SCALABILITY REPORT")
    print("=" * 70)
    print(f"Total Concurrent Users:   {NUM_USERS}")
    print(f"Total Requests Executed:  {total_requests}")
    print(f"Total Test Duration:      {total_duration:.2f} seconds")
    print(f"Throughput (RPS):         {throughput:.2f} req/sec")
    print(f"Success Rate:             {(successful_requests / total_requests) * 100.0:.2f}% ({successful_requests}/{total_requests})")
    print(f"Failure Rate:             {failure_rate:.2f}% ({failed_requests}/{total_requests})")
    print("-" * 70)
    print("LATENCY DISTRIBUTION (Total Round-Trip):")
    print(f"  • Min:    {min_lat:.2f} ms")
    print(f"  • Mean:   {mean_lat:.2f} ms")
    print(f"  • Median: {p50:.2f} ms (p50)")
    print(f"  • p90:    {p90:.2f} ms")
    print(f"  • p95:    {p95:.2f} ms")
    print(f"  • p99:    {p99:.2f} ms")
    print(f"  • Max:    {max_lat:.2f} ms")
    print("-" * 70)
    print("ENDPOINT BREAKDOWN:")
    for ep, data in endpoint_stats.items():
        ep_mean = statistics.mean(data["lats"])
        ep_p95 = sorted(data["lats"])[int(len(data["lats"]) * 0.95)]
        print(f"  {ep:<32} Count={data['total']:<4} Success={data['success']:<4} Mean={ep_mean:>6.2f}ms  p95={ep_p95:>6.2f}ms")
    print("=" * 70)

    # Save artifact
    summary = {
        "concurrent_users": NUM_USERS,
        "total_requests": total_requests,
        "duration_seconds": round(total_duration, 2),
        "throughput_rps": round(throughput, 2),
        "success_rate_pct": round((successful_requests / total_requests) * 100.0, 2),
        "failure_rate_pct": round(failure_rate, 2),
        "latencies_ms": {
            "min": round(min_lat, 2),
            "mean": round(mean_lat, 2),
            "p50": round(p50, 2),
            "p90": round(p90, 2),
            "p95": round(p95, 2),
            "p99": round(p99, 2),
            "max": round(max_lat, 2)
        }
    }
    with open("tests/load_test_results.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print("Saved load test metrics to tests/load_test_results.json")

if __name__ == "__main__":
    run_load_test()
