#include <iostream>
#include <vector>
using namespace std;

int main() {
    int arr1[5] = {1, 2, 3, 4, 5};
    int arr2[5] = {1, 2, 3, 4, 5};
    
    // Judge if two arrays are equal
    bool isEqual = true;
    for (int i = 0; i < 5; i++) {
        if (arr1[i] != arr2[i]) {
            isEqual = false;
            break;
        }
    }
    
    cout << "Arrays are " << (isEqual ? "equal" : "not equal") << endl;
    
    // Use vector to write similar program
    vector<int> vec1 = {1, 2, 3, 4, 5};
    vector<int> vec2 = {1, 2, 3, 4, 5};
    
    bool vecEqual = true;
    for (int i = 0; i < vec1.size(); i++) {
        if (vec1[i] != vec2[i]) {
            vecEqual = false;
            break;
        }
    }
    
    cout << "Vectors are " << (vecEqual ? "equal" : "not equal") << endl;
    
    return 0;
}