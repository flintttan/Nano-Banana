#!/bin/bash

# Comprehensive Test Runner for Nano-Banana API Integration
# This script runs all API integration and workflow tests

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    NANO-BANANA API TEST SUITE                              ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}Checking server status...${NC}"
if ! curl -s http://localhost:3010/api/health > /dev/null 2>&1; then
    echo -e "${RED}Error: Server is not running on http://localhost:3010${NC}"
    echo -e "${YELLOW}Please start the server with: npm start${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Run API Integration Tests
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    API INTEGRATION TESTS                                   ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

if node test-api-integration.js; then
    API_RESULT="${GREEN}PASSED${NC}"
    API_EXIT=0
else
    API_RESULT="${RED}FAILED${NC}"
    API_EXIT=1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    USER WORKFLOW TESTS                                     ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

if node test-user-workflows.js; then
    WORKFLOW_RESULT="${GREEN}PASSED${NC}"
    WORKFLOW_EXIT=0
else
    WORKFLOW_RESULT="${RED}FAILED${NC}"
    WORKFLOW_EXIT=1
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SUMMARY                                       ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "API Integration Tests: $API_RESULT"
echo "User Workflow Tests:   $WORKFLOW_RESULT"
echo ""

if [ $API_EXIT -eq 0 ] && [ $WORKFLOW_EXIT -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Generated Reports:"
    echo "  - API_INTEGRATION_TEST_REPORT.md"
    echo "  - COMPREHENSIVE_TEST_SUMMARY.md"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Please check the detailed reports for more information:"
    echo "  - API_INTEGRATION_TEST_REPORT.md"
    echo "  - COMPREHENSIVE_TEST_SUMMARY.md"
    echo ""
    exit 1
fi
