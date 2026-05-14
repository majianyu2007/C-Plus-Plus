#include <algorithm>
#include <cctype>
#include <iostream>
#include <map>
#include <sstream>
#include <string>

using namespace std;

bool isPunc(char c)
{
    return c == ',' || c == '.' || c == ';' || c == '!' ||
           c == '?' || c == '"' || c == '\'';
}

int main()
{
    map<string, int> freq;
    string line;

    while (getline(cin, line))
    {
        if (line == "exit")
            break;

        line.erase(remove_if(line.begin(), line.end(), isPunc), line.end());

        transform(line.begin(), line.end(), line.begin(),
                  [](unsigned char c) {
                      return static_cast<char>(tolower(c));
                  });

        stringstream ss(line);
        string word;

        while (ss >> word)
        {
            freq[word]++;
        }
    }

    for (const auto &p : freq)
    {
        cout << p.first << " " << p.second << endl;
    }

    return 0;
}
