#include <iostream>
#include <string>
#include <algorithm>

using std::cin;
using std::cout;
using std::endl;
using std::sort;
using std::string;

int main(void)
{
    int nums[3];
    cin >> nums[0] >> nums[1] >> nums[2];
    
    string order;
    cin >> order;
    
    int sorted_nums[3] = {nums[0], nums[1], nums[2]};
    sort(sorted_nums, sorted_nums + 3);

    for (int i = 0; i < 3; i++) {
        if (i > 0) cout << " ";
        char c = order[i];
        if (c == 'A') {
            cout << sorted_nums[0];
        } else if (c == 'B') {
            cout << sorted_nums[1];
        } else if (c == 'C') {
            cout << sorted_nums[2];
        }
    }
    cout << endl;
    
    return 0;
}